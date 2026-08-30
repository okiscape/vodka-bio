export default function App() {
 return (
  <div className="flex gap-15 items-center not-found-container">
   <div className="flex flex-col items-center">
    <h1>not found???</h1>
    <a href="/">&lt;- return to main page</a>
   </div>
   <video src="/videos/404.mp4"  className="w-60" autoPlay loop/>
  </div>)
}
