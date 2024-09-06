import { useUpdateUser } from '@/hooks/userHooks';
import { GetMeResponse } from '@/services/userService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast"
import { z } from "zod"
import { Form, FormField } from '../ui/form';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useQueryClient } from '@tanstack/react-query';

const updateUserFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    bio: z.string(),
});

export type UpdateUserFormSchemaType = z.infer<typeof updateUserFormSchema>;

const PersonalDetails = ({ user }: { user: GetMeResponse }) => {


    const queryClient = useQueryClient();

    const updateUser = useUpdateUser();
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<UpdateUserFormSchemaType>({
        resolver: zodResolver(updateUserFormSchema),
        defaultValues: {
            name: "",
            email: "",
            bio: "",
        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.data.name || "",
                email: user.data.email || "",
                bio: user.data.bio || "",
            });
        }
    }, [user, form]);


    function handleSubmit(data: UpdateUserFormSchemaType) {
        console.log(data);
        setIsEditing(false);
        updateUser.mutateAsync(data, {
            onSuccess: () => {
                toast.success("User updated successfully!");
                queryClient.invalidateQueries({
                    queryKey: ["me"],
                });
            },
            onError: (error: Error) => {
                toast.error(error.message);
            },
        });
    }

    function handleEditClick() {
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setIsEditing(false);
        if (user) {
            form.reset({
                name: user.data.name || "",
                email: user.data.email || "",
                bio: user.data.bio || "",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full">
                <section className="md:flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-amber-900">Personal Details</h2>
                        {isEditing ? (
                            <div>
                                <Button type="submit" className="mr-2">
                                    Save
                                </Button>
                                <Button type="button" onClick={handleCancelEdit} variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleEditClick}
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <div>
                                    <Label htmlFor="name" className="text-black">Name</Label>
                                    <Input
                                        disabled={!isEditing}
                                        className="border-blue-200 focus:border-blue-500"
                                        {...field}
                                    />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <div>
                                    <Label htmlFor="email" className="text-black">Email</Label>
                                    <Input
                                        disabled={!isEditing}
                                        className="border-blue-200 focus:border-blue-500"
                                        {...field}
                                    />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <div>
                                    <Label htmlFor="bio" className="text-black">Bio</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        className="border-blue-200 focus:border-blue-500"
                                        {...field}
                                    />
                                </div>
                            )}
                        />
                    </div>
                </section>
            </form>
        </Form>
    )
}

export default PersonalDetails
