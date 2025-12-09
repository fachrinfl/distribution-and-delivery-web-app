"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function MapError({ message }: { message: string }) {
  return (
    <Card className="border-danger/50 bg-red-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-danger" />
          <CardTitle className="text-danger">Mapbox Configuration Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold mb-2">How to fix:</p>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mapbox Access Tokens</a></li>
            <li>Create or copy a <strong>PUBLIC token</strong> (starts with <code className="bg-gray-100 px-1 rounded">pk.</code>)</li>
            <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root</li>
            <li>Add: <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

