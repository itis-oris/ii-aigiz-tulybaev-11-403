'use client';

import type { ChangeEvent, ComponentProps } from 'react';
import { useMemo, useState } from 'react';

type ValidateFn<TValues extends Record<string, string>> = (
    values: TValues,
) => Partial<Record<keyof TValues, string>>;

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export const useValidatedForm = <TValues extends Record<string, string>>(
    initialValues: TValues,
    validate: ValidateFn<TValues>,
) => {
    const [values, setValues] = useState<TValues>(initialValues);
    const [errors, setErrors] = useState<
        Partial<Record<keyof TValues, string>>
    >({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isValid = useMemo(
        () => Object.keys(validate(values)).length === 0,
        [validate, values],
    );

    const handleChange =
        (name: keyof TValues) => (event: ChangeEvent<HTMLInputElement>) => {
            const nextValue = event.target.value;

            setValues((current) => ({
                ...current,
                [name]: nextValue,
            }));

            if (errors[name] || isSubmitted) {
                setErrors(
                    validate({
                        ...values,
                        [name]: nextValue,
                    }),
                );
            }
        };

    const handleBlur = (name: keyof TValues) => () => {
        const nextErrors = validate(values);

        if (nextErrors[name] || errors[name]) {
            setErrors(nextErrors);
        }
    };

    const handleSubmit: FormSubmitHandler = (event) => {
        event.preventDefault();
        setIsSubmitted(true);
        setErrors(validate(values));
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setIsSubmitted(false);
    };

    return {
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitted,
        isValid,
        resetForm,
        values,
    };
};
