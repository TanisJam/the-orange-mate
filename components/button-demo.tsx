"use client";

import { Button } from "./ui/button";

export function ButtonDemo() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-heading text-primary">Button Components</h2>
        <p className="text-lg font-body text-neutral-gray">
          Showcasing all button variants and states from your design system
        </p>
      </div>

      {/* Base State */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading text-neutral-black">Base State</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" size="default">
            Registrarse
          </Button>
          <Button variant="accent" size="default">
            Registrarse
          </Button>
          <Button variant="outline" size="default">
            Registrarse
          </Button>
          <Button variant="primary" size="default">
            Registrarse
          </Button>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading text-neutral-black">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="default">
            Default
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" size="icon">
            ⚙
          </Button>
        </div>
      </div>

      {/* All Variants */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading text-neutral-black">All Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Disabled State */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading text-neutral-black">Disabled State</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" disabled>
            Disabled Primary
          </Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
          <Button variant="accent" disabled>
            Disabled Accent
          </Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </div>

      {/* Interactive Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading text-neutral-black">Interactive Examples</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="primary" 
            onClick={() => alert('Primary button clicked!')}
          >
            Click Me
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => alert('Secondary button clicked!')}
          >
            Click Me
          </Button>
          <Button 
            variant="outline" 
            onClick={() => alert('Outline button clicked!')}
          >
            Click Me
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => alert('Destructive button clicked!')}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading text-neutral-black">Usage Examples</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button variant="primary" size="sm">
              Save
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm">
              Back
            </Button>
            <Button variant="secondary" size="default">
              Continue
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
            <Button variant="link" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 