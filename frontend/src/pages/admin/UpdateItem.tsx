import { useGetItemDetails, useUpdateItem } from '@/hooks/itemHooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { format, isToday, parseISO } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useEffect, useState } from 'react';
import { useUploadImage } from '@/hooks/useUploadImage';
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be atleast 3 characters." }),
  description: z.string().min(3, { message: "Description must be atleast 3 characters." }),
  startingPrice: z.number().min(1, { message: "Starting price must be atleast 1." }),
  image: z.string(),
  viewImage: z.string(),
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

function UpdateItem() {

  const [imageKey, setImageKey] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [currentImage, setCurrentImage] = useState<string>("")
  useDocumentTitle("Update Item");
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const { data: itemDetails, isLoading: isFetchingItemDetails } = useGetItemDetails(id!);
  const { mutate: updateItem, isPending } = useUpdateItem();
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadImage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startingPrice: 0,
      image: "",
      viewImage: "",
      auctionEndTime: {
        date: new Date(),
        time: format(new Date(), "HH:mm")
      },
    },
  });

  useEffect(() => {
    if (itemDetails) {
      const auctionEndTime = parseISO(itemDetails.item.auctionEndTime);
      form.reset({
        name: itemDetails.item.name,
        description: itemDetails.item.description,
        startingPrice: itemDetails.item.startingPrice,
        image: "",
        viewImage: itemDetails.item.image,
        auctionEndTime: {
          date: auctionEndTime,
          time: format(auctionEndTime, "HH:mm")
        },
      });
      setImageKey(itemDetails.item.imageKey);
      setCurrentImage(itemDetails.item.image);
    }
  }, [itemDetails, form]);

  if (isFetchingItemDetails) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("images", file);
      uploadImage(formData, {
        onSuccess: (response) => {
          const { key, url } = response.data;
          setImageKey(key);
          setCurrentImageUrl(url);
          toast.success("Image uploaded successfully");
        },
        onError: (error: Error) => {
          toast.error("Image upload failed: " + error.message);
        },
      });
    } catch {
      toast.error("Image upload failed");
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedValues = {
      ...values,
      image: imageKey
    };

    updateItem({ id: id!, data: updatedValues }, {
      onSuccess: (response) => {
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

  const totalBids = itemDetails?.item.bids?.length || 0;

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
                      <Input readOnly={totalBids > 0} type="number" placeholder="0" {...field} onChange={e => field.onChange(+e.target.value)} />
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
                                // If it's today, also update the time
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
                      <div>
                        {
                          currentImageUrl ?
                            <img src={currentImageUrl} alt="item-image" className="w-28 h-28 object-cover" /> :
                            <img
                              src={form.getValues("viewImage")}
                              alt="item-image"
                              className="w-28 h-28 object-cover"
                            />
                        }
                      </div>
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
                  isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Item</span>
                }
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default UpdateItem
