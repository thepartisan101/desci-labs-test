"use client"
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios, { AxiosError } from 'axios';
import { BasicIpfsData, ErrorResponse } from "../api/ipfs";
import { useSignMessage, useAccount } from 'wagmi';

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

  const { address } = useAccount()

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
  });

  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = form;
  
  const noteContent = watch("bio", "");
  
  const [isMessageSigned, setMessageSigned] = useState(false);

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: watch("bio") // Watching the form field for the note content
  });

  const handleSign = () => {
    console.log("Initiating signing process");
    signMessage();
    console.log("Signing process called");
  };

  useEffect(() => {
      if (isSuccess) {
          setMessageSigned(true);
          toast({
            title: "Success",
            description: "User signed the message"
          });
      } else if (isError) {
        setMessageSigned(false);
        toast({
            variant: "destructive",
            title: "Error",
            description: "User rejected signature"
        });
      }
  }, [isSuccess, isError]);



  

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Include user's address (from the signed message) in the metadata for IPFS upload.
    // Assuming `data` contains the signed message with the user's address.
    console.log("Address used for note upload:", address);

    try {
      const response = await axios.post<BasicIpfsData>('/api/ipfs', { 
        noteData: {
          text: data.bio,
          metadata: {
            userAddress: address
          }
        }
      });
  
      console.log("Received data:", response.data);  // log the received data
      toast({
        title: "Note was uploaded",
        description: `Signed by user: ${address}`
      });

      // Reset state and form values
      setMessageSigned(false);
      reset({ bio: "" });  // reset the form fields
      handleLoad();  // call the handleLoad function after a successful upload

    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
    
      // temporal
      console.error("Full error object:", axiosError);
      // 
      if (axiosError.response) {
        console.error('Error submitting note:', axiosError.response?.data?.error || axiosError.message);
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
                <form 
                  onSubmit={(e) => {
                    if (!isMessageSigned) {
                        e.preventDefault();  // Prevent the form from submitting
                        handleSign();
                    } else {
                        handleSubmit(onSubmit)(e);  // Proceed with form submission
                    }
                  }} 
                  className="space-y-6">
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
                    <Button 
                      type="submit" 
                      onClick={() => {
                        console.log("Button clicked");
                        isMessageSigned ? handleSubmit(onSubmit) : handleSign();
                      }}
                      disabled={noteContent.length < 10}
                      >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing message...
                        </>
                      ) : isMessageSigned ? "Upload" : "Sign message"}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}
