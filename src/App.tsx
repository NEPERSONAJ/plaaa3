// В компоненте ProductDialog обновить отображение изображений
function ProductDialog({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // ... остальной код без изменений

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "bg-white p-0 rounded-2xl overflow-hidden transition-all duration-300",
        isFullscreen ? "w-screen h-screen max-w-none rounded-none" : "sm:max-w-[500px]"
      )}>
        <div className="relative">
          <div className={cn(
            "relative group",
            isFullscreen ? "h-screen" : "h-[250px] sm:h-[300px]"
          )}>
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-contain bg-gray-50"
              onClick={!isFullscreen ? toggleFullscreen : undefined}
            />
            {/* ... остальные элементы управления */}
          </div>
        </div>
        {/* ... остальной контент */}
      </DialogContent>
    </Dialog>
  );
}