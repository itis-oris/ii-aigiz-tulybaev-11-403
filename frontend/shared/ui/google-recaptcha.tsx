'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        grecaptcha?: {
            ready: (callback: () => void) => void;
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    'expired-callback': () => void;
                },
            ) => number;
            reset: (widgetId?: number) => void;
        };
    }
}

type GoogleRecaptchaProps = {
    siteKey: string;
    onChange: (token: string) => void;
};

export function GoogleRecaptcha({ siteKey, onChange }: GoogleRecaptchaProps) {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isScriptLoaded || !containerRef.current || !window.grecaptcha) {
            return;
        }

        if (widgetIdRef.current !== null) {
            return;
        }

        window.grecaptcha.ready(() => {
            if (
                !containerRef.current ||
                !window.grecaptcha ||
                typeof window.grecaptcha.render !== 'function' ||
                widgetIdRef.current !== null
            ) {
                return;
            }

            widgetIdRef.current = window.grecaptcha.render(
                containerRef.current,
                {
                    sitekey: siteKey,
                    callback: onChange,
                    'expired-callback': () => onChange(''),
                },
            );
        });
    }, [isScriptLoaded, onChange, siteKey]);

    return (
        <>
            <Script
                id="google-recaptcha-script"
                src="https://www.google.com/recaptcha/api.js?render=explicit"
                strategy="afterInteractive"
                onLoad={() => setIsScriptLoaded(true)}
            />
            <div ref={containerRef} />
        </>
    );
}
