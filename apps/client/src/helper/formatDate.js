function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-based
  const year = d.getFullYear();
  const result= `${day}/${month}/${year}` ;
  if(result.includes("NaN")) return "N/A";
  return result;
}
export default formatDate;  
