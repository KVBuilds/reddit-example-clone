'use client'

import { UsernameValidator } from '@/lib/validators/username'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { Label } from './ui/Label'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
    user: Pick<User, 'id' | 'username'>
}

type FormData = z.infer<typeof UsernameValidator>

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
    const router = useRouter()

    const {
        handleSubmit, 
        register,
        formState: {errors},
    } = useForm<FormData>({
        resolver: zodResolver(UsernameValidator),
        defaultValues: {
            name: user?.username || '',
        },
    })

 /*
const UserNameForm: FC<UserNameFormProps> = ({user}) => {
    //Adding a custom validator 
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<UserNameRequest>({
        resolver: zodResolver(UsernameValidator), //Helps form submission fail if data doesn't match from client side 
        defaultValues: {
            name: user?.username || '',
        },
    }) 

    const router = useRouter()*/

    const {mutate: updateUsername, isLoading} = useMutation({
        mutationFn: async ({name}: FormData) => {
            const payload: FormData = {name}

            const {data} = await axios.patch(`/api/username`, payload)
            return data
        }, 
        onError: (err) => {
            if (err instanceof AxiosError) {
                if(err.response?.status === 409) {
                    return toast({
                        title: 'Usernamae already exists.',
                        description: 'Please choose a different username.',
                        variant: 'destructive',
                    })
                }
              }
                     return toast({
                        title: 'Somethign went wrong.',
                        description: 'Your username was not updated. Please try again.',
                        variant: 'destructive',
                    })
            },
            onSuccess: () => {
                toast({
                    description: 'Your username has been updated.'
                })
                router.refresh()
            },
        })

    // Form logic handled by React hook form 
    return ( 
    <form className={cn(className)} onSubmit={handleSubmit((e) => updateUsername(e))}
        {...props}>
    <Card>
        <CardHeader>
            <CardTitle>Your username</CardTitle>
            <CardDescription>
                Please enter a username. 
            </CardDescription> 
        </CardHeader>
        <CardContent>
            <div className='relative grid gap-1'>
                <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
                    <span className='text-sm text-zinc-400'>u/</span>
                </div>
                <Label className='sr-only' htmlFor='name'>Name</Label>
                <Input id='name' className='w-[400px] pl-6' size={32} {...register('name')} />

                {errors?.name && (
                    <p className='px-1 text-xs text-red-600'>
                        {errors.name.message}
                    </p>
                )}
            </div>
        </CardContent>
        <CardFooter>
            <Button isLoading={isLoading}>Update username</Button>
        </CardFooter>
    </Card>
    </form>
    )
}