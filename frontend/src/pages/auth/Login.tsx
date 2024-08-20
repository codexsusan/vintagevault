import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { useAuth } from "@/hooks/useAuth";
import { useLogin } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginResponse } from "@/services/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
    username: z.string().min(3, { message: "Username must be atleast 3 characters." }),
    password: z
        .string()
        .min(3, { message: "Password must be atleast 3 characters." })
});

function Login() {
    useDocumentTitle("Login");

    const navigate = useNavigate();
    const { mutate: loginMutation, isPending } = useLogin();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        loginMutation(values, {
            onSuccess: (data: LoginResponse) => {
                if (data.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (data.role === "user") {
                    navigate("/home");
                }
                console.log(data);
            },
            onError: (error: Error) => {
                toast.error(error.message, { duration: 2000 });
            },
        });
    };

    // TODO: Can implement referrer for proper alert
    return (
        <div className="min-h-screen font-inter flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                    Login
                </h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="johndoe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={isPending} className="w-full" type="submit">
                            {isPending ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <span>Login</span>
                            )}
                        </Button>
                    </form>
                </Form>
                {/* <p className="text-gray-600 text-sm mt-3 text-center">
                    Don't have an account?{" "}
                    <Link to="/auth/register" className="text-blue-500 hover:underline">
                        Register
                    </Link>
                </p> */}
            </div>
        </div>
    )
}

export default Login
