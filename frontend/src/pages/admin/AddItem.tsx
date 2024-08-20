import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUploadImage } from "@/hooks/useUploadImage";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    url: z.string(),
    key: z.string(),
  }),
});


export type UploadResponse = z.infer<typeof uploadResponseSchema>;

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be atleast 3 characters." }),
  description: z.string().min(3, { message: "Description must be atleast 3 characters." }),
  startingPrice: z.number().min(1, { message: "Starting price must be atleast 1." }),
  isPublished: z.boolean(),
  image: z.string(),
  imageKey: z.string(),
  auctionEndTime: z.date().refine((date) => new Date(date) >= new Date(),
    "Auction end date must be in the future"
  )
});

function AddItem() {

  useDocumentTitle("Add Item");

  const {mutate: uploadImage} = useUploadImage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startingPrice: 0,
      isPublished: false,
      image: "",
      imageKey: "",
      auctionEndTime: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const itemData = {
      name: values.name,
      description: values.description,
      startingPrice: values.startingPrice,
      isPublished: values.isPublished,
      image: values.imageKey,
      auctionEndTime: values.auctionEndTime,
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("images", file);
      uploadImage(formData, {
        onSuccess: (response: UploadResponse) => {
          const { key } = response.data;
          form.setValue("imageKey", key);
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
              <FormField
                control={form.control}
                name="auctionEndTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Auction End Time</FormLabel>
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
                          className="w-full pt-10"
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
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
                name="image"
                render={({ field }) => (
                  <div className="flex space-x-4 items-end">
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
                  </div>
                )}
              />


              <Button className="w-full" type="submit">
                <span>Create Item</span>
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AddItem
