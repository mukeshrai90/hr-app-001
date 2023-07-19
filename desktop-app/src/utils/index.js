export const role= (key)=>{

    if(key == 0) return "Admin HR";
   if(key == 1) return "User";
   if(key == 2) return "Manager";
  }

  export const cap =  (str)=>str[0].toUpperCase() + str.substring(1) ; 