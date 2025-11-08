import Image from "next/image";
import JacoPhoto from "../../../public/jaco1.jpeg";

export default function Header({ className }: { className?: string }) {
  return (
    <header
      className={`flex items-center justify-center text-gray-200 ${className}`}
    >
      <Image
        src={JacoPhoto}
        alt="Jaco"
        width="96"
        height="96"
        className="rounded-full object-cover mr-4"
      />
      <h1 className="text-3xl font-bold">Jaco Dog Sitting</h1>
    </header>
  );
}
