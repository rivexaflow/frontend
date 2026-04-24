"use client";

import { NoiseBackground } from "./noise-background";
import { Button } from "./button";
import { StatefulButton } from "./stateful-button";

export const ComponentDemo = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Noise Background Demo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NoiseBackground className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-800">Animated Noise Background</p>
          </NoiseBackground>
          
          <NoiseBackground 
            className="h-48 bg-blue-100 rounded-lg flex items-center justify-center"
            animation={false}
            opacity={0.05}
          >
            <p className="text-blue-800">Static Noise Background</p>
          </NoiseBackground>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Button Component Demo</h2>
        
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔥</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Stateful Button Demo</h2>
        
        <div className="flex flex-wrap gap-4">
          <StatefulButton onClick={async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("Success!");
          }}>
            Simulate Success
          </StatefulButton>
          
          <StatefulButton 
            onClick={async () => {
              await new Promise(resolve => setTimeout(resolve, 2000));
              throw new Error("Something went wrong!");
            }}
            errorText="Failed!"
          >
            Simulate Error
          </StatefulButton>
          
          <StatefulButton 
            onClick={async () => {
              await new Promise(resolve => setTimeout(resolve, 3000));
            }}
            loadingText="Processing..."
            successText="Done!"
            duration={1500}
          >
            Long Operation
          </StatefulButton>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Combined Example</h2>
        
        <NoiseBackground className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Welcome to RivexaFlow</h3>
            <p className="text-gray-600 text-center max-w-md">
              Experience our beautiful UI components with animated noise backgrounds
            </p>
            <div className="flex gap-2">
              <Button>Get Started</Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
        </NoiseBackground>
      </div>
    </div>
  );
};
