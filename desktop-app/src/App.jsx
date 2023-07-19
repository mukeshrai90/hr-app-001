import { useState } from "react";
import Header from "./Header";
import AppRoutes from "./Routes";
import LoadingSpinner from "./utils/LoadingSpinner";

export function App() {
	
  const [isLoading, setIsLoading] = useState(true);
  
  const hideLoader = ()=>{
      setTimeout(function(){
		  setIsLoading(false);
	  }, 1000);
  }
	
  return (
    <div className="container">
      
	  {isLoading ? <LoadingSpinner /> : ''}
	  
	  { hideLoader()}
	  
	  <Header setIsLoading = {setIsLoading} />
	  
	  <AppRoutes setIsLoading = {setIsLoading} />
	  
    </div>
  );
}
