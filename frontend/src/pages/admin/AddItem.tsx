import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCreateItem } from "@/hooks/itemHooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UploadImageResponse, useUploadImage } from "@/hooks/useUploadImage";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isToday } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be atleast 3 characters." }),
  description: z.string().min(3, { message: "Description must be atleast 3 characters." }),
  startingPrice: z.number().min(1, { message: "Starting price must be atleast 1." }),
  image: z.string(),
  auctionEndTime: z.object({
    date: z.date({
      required_error: "Auction end date is required",
    }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
  }).refine(
    (data) => {
      if (!data.date) return false; // If date is not provided, return false
      const now = new Date();
      const endDateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      endDateTime.setHours(hours, minutes, 0, 0);
      return endDateTime > now;
    },
    {
      message: "Auction end time must be in the future",
      path: ['time', "date"],
    }
  )
});

export type Item = z.infer<typeof formSchema>;

function AddItem() {
  useDocumentTitle("Add Item");
  const [imageKey, setImageKey] = useState<string>("");
  const navigate = useNavigate();

  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadImage();
  const { mutate: createItem, isPending } = useCreateItem();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startingPrice: 0,
      image: "",
      auctionEndTime: {
        date: new Date(),
        time: format(new Date(), "HH:mm")
      },
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {

    const updatedValues = {
      ...values,
      image: imageKey,
    };

    createItem(updatedValues, {
      onSuccess: (response: ApiResponse) => {
        if (response.success) {
          toast.success(response.message);
          navigate("/admin/dashboard");
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("images", file);
      uploadImage(formData, {
        onSuccess: (response: UploadImageResponse) => {
          const { key } = response.data;
          setImageKey(key);
        },
        onError: (error: Error) => {
          toast.error("Image upload failed. Please try again.");
          console.error("Image upload failed:", error);
        },
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div >
        <h3 className="text-2xl font-bold text-gray-600">Item Details</h3>
        <div className="mt-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startingPrice"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Starting Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(+e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start space-x-6 items-end">
                <FormField
                  control={form.control}
                  name="auctionEndTime.date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Auction End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                if (isToday(date)) {
                                  const nextHour = new Date();
                                  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
                                  form.setValue('auctionEndTime.time', format(nextHour, 'HH:mm'));
                                }
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="auctionEndTime.time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-x-4 items-end">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Input id="picture" type="file" {...field} onChange={(e) => {
                          field.onChange(e);
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {
                  isUploadingImage && (
                    <Button disabled size={"icon"}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  )
                }
              </div>
              <Button
                disabled={isPending || isUploadingImage}
                className="w-full"
                type="submit"
              >
                {
                  isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create Item</span>
                }
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AddItem
