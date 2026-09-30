import Link from "next/link";
import Image from "next/image";

type Props = {
  id: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  imageUrl?: string;
};

export default function ProductCard({ id, name, price, promoPrice, imageUrl }: Props) {
  const hasPromo = promoPrice && promoPrice < price;
  return (
    <Link href={`/produto/${id}`} className="card overflow-hidden block animate-fadeIn">
      <div className="relative aspect-square bg-brand-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full skeleton" />
        )}
        {hasPromo && (
          <span className="absolute top-2 left-2 bg-brand-purple text-white text-xs font-bold px-2 py-1 rounded-lg">
            OFERTA
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-brand-gray-700 line-clamp-2 min-h-[2.5rem]">{name}</p>
        <div className="mt-1 flex items-baseline gap-2">
          {hasPromo && <span className="text-xs text-brand-gray-700 line-through">R$ {price.toFixed(2)}</span>}
          <span className="price text-lg">R$ {(hasPromo ? promoPrice! : price).toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
