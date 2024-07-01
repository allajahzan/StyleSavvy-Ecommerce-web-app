// loading order page

function loadSalesReport() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);

    const form = document.getElementById('daterange_form')

    form.addEventListener('submit',(e)=>{

        e.preventDefault();

        const dateRange = document.getElementById('dateRagePicker').value

        const formattedDateRange = dateRange.replace(/ /g, '-'); 
    
        // console.log(formattedDateRange);
    
        if(dateRange !== ''){
            const [startDate, endDate] = formattedDateRange.split('-to-').map(dateStr => dateStr.trim());
        if(startDate && !endDate){
    
            console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
            window.location.href = `/admin/salesReports?report=all&startDate=${startDate}`
    
        }else{
    
            console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
            window.location.href = `/admin/salesReports?report=all&startDate=${startDate}&endDate=${endDate}`
    
        }
        }else{
            null
        }
    })
}
