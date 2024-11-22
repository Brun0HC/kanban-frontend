import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

type IMemberResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type IResponse = {
  member: IMemberResponse;
};

export function ProfilePage() {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<{ message: IResponse }>(
        "/kanban/member/profile"
      );

      return data.message;
    },
  });

  useEffect(() => {
    if (data) {
      form.setValue("name", data.member.name);
      form.setValue("email", data.member.email);
      form.setValue("phone", data.member.phone);
    }
  }, [data, form]);

  const mutation = useMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
    mutationFn: async (data: z.infer<typeof schema>) => {
      await api.patch("kanban/member/update_profile", {
        name: data.name,
        phoe: data.phone,
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof schema>) => {
    mutation.mutate(data);
  };

  return (
    <section className="w-full h-full grid place-items-center">
      <Form {...form}>
        <form
          className="bg-zinc-900/20 px-10 py-8 rounded-md w-5/12 space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <h1 className="text-lg font-semibold">Profile</h1>

          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="phone"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant="secondary" className="w-full" type="submit">
            Update Profile
          </Button>
        </form>
      </Form>
    </section>
  );
}
