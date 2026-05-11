export const metadata = {
  title: 'Lightning Roulette Tracker',
  description: 'Roulette AI Tracker'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
