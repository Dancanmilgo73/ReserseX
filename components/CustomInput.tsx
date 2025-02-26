import React from 'react'
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';
import { authFormSchema } from '@/lib/utils';

const formSchema = authFormSchema('sign-up');

interface CustomInputProps{
    name: FieldPath<z.infer<typeof formSchema>>;
    label: string;
    control: Control<z.infer<typeof formSchema>>;
    type: string;
    placeholder: string;
}

const CustomInput = ({name,label,control,type, placeholder}: CustomInputProps) => {
  return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
            <div className='form-item'>
                <FormLabel className='form-label'>
                    {label}
                </FormLabel>
                <div className='flex w-full flex-col'>
                    <FormControl>
                        <Input
                            placeholder={placeholder}
                            className="input-class"
                            type={type}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage
                        className='form-message mt-2'
                    />
                </div>
            </div>
        )}
        /> 
  )
}

export default CustomInput