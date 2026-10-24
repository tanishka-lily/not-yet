   import "./globals.css";

   export const metadata = {
     title: "Not Yet",
     description: "A calm study partner for hard technical books. It asks, nudges and remembers where you got stuck.",
   };

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>{children}</body>
       </html>
     );
   }