import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export interface ProductContextBannerProps {
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    type: string;
  };
}

export const ProductContextBanner = ({ product }: ProductContextBannerProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  const getTypeBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'RENT':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            RENT
          </span>
        );
      case 'SERVICE':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
            SERVICE
          </span>
        );
      case 'SUBSCRIPTION':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            SUBSCRIPTION
          </span>
        );
      case 'SELL':
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            SELL
          </span>
        );
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/40 backdrop-blur-xs border-b border-border/80 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative size-11 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/60">
          {product.imageUrl && !imageFailed ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              onError={() => setImageFailed(true)}
              className="size-full object-cover"
            />
          ) : (
            <Package className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground truncate max-w-[180px] sm:max-w-[280px]">
              {product.title}
            </h4>
            {getTypeBadge(product.type)}
          </div>
          <p className="text-xs font-semibold text-primary mt-0.5">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      <Link to={`/dashboard/products/${product.id}`} className="shrink-0">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-medium">
          <span>View Item</span>
          <ExternalLink className="size-3.5" />
        </Button>
      </Link>
    </div>
  );
};

export default ProductContextBanner;
