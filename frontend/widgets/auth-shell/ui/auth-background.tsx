import { authBackgroundWords } from '@/widgets/auth-shell/lib/auth-background';

export const AuthBackground = () => {
    return (
        <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,103,215,0.08),transparent_32%),linear-gradient(180deg,rgba(248,249,252,0.55)_0%,rgba(255,255,255,0)_100%)]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {authBackgroundWords.map((word) => (
                    <span
                        key={word.id}
                        className="absolute whitespace-nowrap text-[7rem] font-semibold tracking-normal text-black/85 blur-[2.5px] sm:text-[9rem] lg:text-[11rem]"
                        style={{
                            top: word.top,
                            left: word.left,
                            transform: 'rotate(-18deg)',
                        }}
                    >
                        <span>S</span>
                        <span className={word.printClassName}>p</span>
                        <span className={word.printClassName}>r</span>
                        <span className={word.printClassName}>i</span>
                        <span className={word.printClassName}>n</span>
                        <span className={word.printClassName}>t</span>
                        <span>ly</span>
                    </span>
                ))}
            </div>
        </>
    );
};
