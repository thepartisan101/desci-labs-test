"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios, { AxiosError } from 'axios';
import { BasicIpfsData, ErrorResponse } from "../api/ipfs";

import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "./ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"


interface NoteFormProps {
  handleLoad: () => void;
}

const FormSchema = z.object({
  bio: z
    .string()
    .min(10, {
      message: "Note must be at least 10 characters.",
    })
    .max(280, {
      message: "Note must not be longer than 280 characters.",
    }),
})

export const NoteForm = ({ handleLoad }: NoteFormProps) => {

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = form;
  

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await axios.post<BasicIpfsData>('/api/ipfs', { text: data.bio });
  
      console.log("Received data:", response.data);  // log the received data
      toast({
        title: "Note was uploaded",
      });

      reset({ bio: "" });  // reset the form fields

      handleLoad();  // call the handleLoad function after a successful upload

    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
    
      if (axiosError.response) {
        console.error('Error submitting note:', axiosError.response.data.error);
      } else if (axiosError.request) {
        console.error('Error submitting note:', axiosError.message);
      } else {
        console.error('Error', axiosError.message);
      }
    }
  }


  return (
    <Card>
        <CardHeader>
            <CardTitle>Add a New Note</CardTitle>
            <CardDescription>Add any text you want. Click save to upload to IPFS.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea
                            placeholder="Here goes your note"
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            You can <span>@mention</span> other users or organizations.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">Upload</Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}
