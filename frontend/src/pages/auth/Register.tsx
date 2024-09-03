import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ApiResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({

    name: z.string().min(3, { message: "Username must be atleast 3 characters." }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(3, { message: "Password must be atleast 3 characters." })
});


const Register = () => {
    useDocumentTitle("Register");
    const navigate = useNavigate();
    const { mutate: registerMutation, isPending } = useRegister(); 
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });


    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values);
        registerMutation(values, {
            onSuccess: (data: ApiResponse) => {
                if(data.success) {
                    toast.success("Successfully registered", { duration: 2000 });

                    setTimeout(() => {
                        navigate("/auth/login");
                    }, 2000);
                } else{
                    toast.error(data.message, { duration: 2000 });
                }
            },
            onError: (error: Error) => {
                toast.error(error.message, { duration: 2000 });
            },
        });
    };
  return (
      <div className="min-h-screen font-inter flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
              <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                  Register
              </h2>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                      <Input type="email" placeholder="johndoe@example.com" {...field} />
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
                              <span>Register</span>
                          )}
                      </Button>
                  </form>
              </Form>
              <div className="flex mt-4 justify-center">
                  <p className="text-center text-gray-500 text-sm">
                      Already have an account? <Link to="/auth/login" className="text-blue-500 hover:underline">Login</Link>
                  </p>
              </div>
          </div>
      </div>
  )
}

export default Register
