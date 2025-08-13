import { Input } from "@/components/ui/input";

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    id: string;
}

export default function OtpInput({ value, onChange, onKeyDown, id }: OtpInputProps) {
    return (
        <Input
            id={id}
            type="text"
            maxLength={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="bg-[#1F2A44] border-[#4B8B9B]/30 text-white text-center text-lg w-12 h-12 rounded-lg focus:ring-2 focus:ring-[#4B8B9B] focus:border-[#4B8B9B] transition"
            required
        />
    );
}