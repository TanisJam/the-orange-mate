export function DesignSystemDemo() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-heading text-primary">
          Design System Demo
        </h1>
        <p className="text-lg font-body text-neutral-gray">
          Demostración de los colores y tipografía del sistema de diseño
        </p>
      </div>

      {/* Primary Colors */}
      <div className="space-y-2">
        <h2 className="text-2xl font-heading text-neutral-black">
          Primary Colors
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-primary-light rounded-[--radius] flex items-center justify-center text-white font-bold">
            Light
          </div>
          <div className="w-20 h-20 bg-primary rounded-[--radius] flex items-center justify-center text-white font-bold">
            Main
          </div>
          <div className="w-20 h-20 bg-primary-dark rounded-[--radius] flex items-center justify-center text-white font-bold">
            Dark
          </div>
        </div>
      </div>

      {/* Accent Colors */}
      <div className="space-y-2">
        <h2 className="text-2xl font-heading text-neutral-black">
          Accent Colors
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-accent-light rounded-[--radius] flex items-center justify-center text-white font-bold">
            Light
          </div>
          <div className="w-20 h-20 bg-accent rounded-[--radius] flex items-center justify-center text-white font-bold">
            Main
          </div>
          <div className="w-20 h-20 bg-accent-dark rounded-[--radius] flex items-center justify-center text-white font-bold">
            Dark
          </div>
        </div>
      </div>

      {/* Secondary Colors */}
      <div className="space-y-2">
        <h2 className="text-2xl font-heading text-neutral-black">
          Secondary Colors
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-secondary-light rounded-[--radius] flex items-center justify-center text-white font-bold">
            Light
          </div>
          <div className="w-20 h-20 bg-secondary rounded-[--radius] flex items-center justify-center text-white font-bold">
            Main
          </div>
          <div className="w-20 h-20 bg-secondary-dark rounded-[--radius] flex items-center justify-center text-white font-bold">
            Dark
          </div>
        </div>
      </div>

      {/* Neutral Colors */}
      <div className="space-y-2">
        <h2 className="text-2xl font-heading text-neutral-black">
          Neutral Colors
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-neutral-white border-2 border-neutral-gray rounded-[--radius] flex items-center justify-center text-neutral-black font-bold">
            White
          </div>
          <div className="w-20 h-20 bg-neutral-light border-2 border-neutral-gray rounded-[--radius] flex items-center justify-center text-neutral-black font-bold">
            Light
          </div>
          <div className="w-20 h-20 bg-neutral-gray rounded-[--radius] flex items-center justify-center text-white font-bold">
            Gray
          </div>
          <div className="w-20 h-20 bg-neutral-black rounded-[--radius] flex items-center justify-center text-white font-bold">
            Black
          </div>
        </div>
      </div>

      {/* State Colors */}
      <div className="space-y-2">
        <h2 className="text-2xl font-heading text-neutral-black">
          State Colors
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-error rounded-[--radius] flex items-center justify-center text-white font-bold">
            Error
          </div>
          <div className="w-20 h-20 bg-success rounded-[--radius] flex items-center justify-center text-white font-bold">
            Success
          </div>
        </div>
      </div>

      {/* Typography Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-heading text-neutral-black">
          Typography
        </h2>
        <div className="space-y-2">
          <h1 className="text-4xl font-heading text-primary">
            Bebas Neue Heading
          </h1>
          <h2 className="text-2xl font-heading text-accent">
            Bebas Neue Subheading
          </h2>
          <p className="text-lg font-body text-neutral-black">
            Oxanium body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <p className="text-base font-body text-neutral-gray">
            Oxanium regular text - Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>

      {/* Buttons with Design System */}
      <div className="space-y-4">
        <h2 className="text-2xl font-heading text-neutral-black">
          Buttons
        </h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-primary text-white rounded-[--radius] font-body border-[--stroke-width] border-primary hover:bg-primary-dark transition-colors">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-secondary text-white rounded-[--radius] font-body border-[--stroke-width] border-secondary hover:bg-secondary-dark transition-colors">
            Secondary Button
          </button>
          <button className="px-6 py-3 bg-transparent text-primary rounded-[--radius] font-body border-[--stroke-width] border-primary hover:bg-primary hover:text-white transition-colors">
            Outline Button
          </button>
        </div>
      </div>
    </div>
  );
} 