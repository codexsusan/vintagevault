import { useUpdateUser } from '@/hooks/userHooks';
import { GetMeResponse } from '@/services/userService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '../ui/form';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import Tooltip from '../custom/tooltip';
import { useGetAutoBidConfig, useToggleActivateAutoBid } from '@/hooks/autoBidHooks';
import { Switch } from '../ui/switch';

const updateUserFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    bio: z.string(),
});

const userAutoBidStatus = z.object({
    status: z.boolean(),
});

export type UserAutoBidStatus = z.infer<typeof userAutoBidStatus>;

export type UpdateUserFormSchemaType = z.infer<typeof updateUserFormSchema>;

const PersonalDetails = ({ user }: { user: GetMeResponse }) => {
    const queryClient = useQueryClient();

    const updateUser = useUpdateUser();
    const { data: autoBidConfigResponse, isLoading: configLoading, } = useGetAutoBidConfig();
    const toggleActivateAutoBid = useToggleActivateAutoBid();
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<UpdateUserFormSchemaType>({
        resolver: zodResolver(updateUserFormSchema),
        defaultValues: {
            name: "",
            email: "",
            bio: "",
        }
    });

    const autoBidStatusForm = useForm<UserAutoBidStatus>({
        resolver: zodResolver(userAutoBidStatus),
        defaultValues: {
            status: false,
        }
    });

    const autoBidConfig = autoBidConfigResponse?.data;

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.data.name || "",
                email: user.data.email || "",
                bio: user.data.bio || "",
            });
        }
    }, [user, form]);

    useEffect(() => {
        if (autoBidConfigResponse) {
            autoBidStatusForm.setValue('status', autoBidConfigResponse.data.status === "active");
        }
    }, [autoBidConfigResponse, autoBidStatusForm]);

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

    const handleAutoBidToggle = async (checked: boolean) => {
        if (checked && !autoBidConfig) {
            return;
        }

        toggleActivateAutoBid.mutate(undefined, {
            onSuccess: () => {
                toast.success(checked ? "Auto-bid activated" : "Auto-bid deactivated");
                autoBidStatusForm.setValue('status', checked);
            },
            onError: (error: Error) => {
                toast.error(error.message);
            },
        });



    };

    console.log({ autoBidConfigResponse })

    return (
        <div>
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
            <Form {...autoBidStatusForm}>
                <form className="space-y-4 w-full">
                    <Tooltip text={autoBidConfigResponse === undefined ? "You haven't configured Auto-Bid" : ""}>
                        <FormField
                            control={autoBidStatusForm.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base cursor-pointer">
                                            Auto Bid
                                        </FormLabel>
                                        <FormDescription>
                                            {autoBidConfigResponse === undefined && "You haven't used autobid feature yet."}
                                            {autoBidConfigResponse?.data.status === "active" && "Auto-bid is active"}
                                            {autoBidConfigResponse?.data.status === "paused" && "Auto-bid is paused"}
                                        </FormDescription>
                                    </div>
                                    <FormControl className='cursor-pointer'>
                                        <Switch
                                            disabled={configLoading || autoBidConfigResponse === undefined}
                                            checked={field.value}
                                            onCheckedChange={handleAutoBidToggle}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </Tooltip>
                </form>
            </Form>
            {/* <AutoBidDialog
                data={autoBidConfigResponse?.data}
                isOpen={isAutoBidDialogOpen}
                onClose={() => {
                    setIsAutoBidDialogOpen(false);
                    refetchConfig();
                }}
                itemId={id!}
            >
                <Button
                    className='mt-5 w-full'
                    onClick={(e) => {
                        e.preventDefault();
                        setIsAutoBidDialogOpen(true);
                    }}
                    variant={"secondary"}
                >
                    {
                        autoBidConfigResponse === undefined ? <span> Configure Auto-Bid</span> : <span>Update Auto-Bid</span>
                    }
                </Button>
            </AutoBidDialog> */}
        </div>
    )
}

export default PersonalDetails
