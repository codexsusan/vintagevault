import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateItem } from "@/hooks/itemHooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UploadImageResponse, useUploadImage } from "@/hooks/useUploadImage";
import { cn } from "@/lib/utils";
import { CreateItemResponse } from "@/services/itemService";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be atleast 3 characters." }),
  description: z.string().min(3, { message: "Description must be atleast 3 characters." }),
  startingPrice: z.number().min(1, { message: "Starting price must be atleast 1." }),
  isPublished: z.boolean(),
  image: z.string(),
  auctionEndTime: z.object({
    date: z.date().refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Auction end date must be in the future"),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
  })
});

export type Item = z.infer<typeof formSchema>;

function AddItem() {
  const [imageKey, setImageKey] = useState<string>("");

  useDocumentTitle("Add Item");

  const navigate = useNavigate();

  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadImage();

  const { mutate: createItem, isPending } = useCreateItem();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startingPrice: 0,
      isPublished: false,
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
      onSuccess: (response: CreateItemResponse) => {
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
          console.log("Image uploaded successfully:", key);
        },
        onError: (error: Error) => {
          console.error("Image upload failed:", error);
        },
      });
    } catch (error) {
      console.error("Image upload failed:", error);
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
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish Now
                      </FormLabel>
                      <FormDescription>
                        Publish your item now
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                            onSelect={field.onChange}
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
