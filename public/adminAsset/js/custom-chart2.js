(function ($) {
    "use strict";
    let price=[]
    console.log('afjakfke')
    $.ajax({
        url:'/admin/test2',
       
        method:'get',
        success:(response)=>{    
       console.log(response);
        let dateArray = response.date
        let countArray = response.total

        console.log(dateArray,'hhahhaahaha',countArray );
   
    /*Sale statistics Chart*/
    if ($('#myChart657').length) {
        var ctx = document.getElementById('myChart657').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                // labels: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'],
                labels: 
                
                [
                    dateArray[0],
                    dateArray[1],
                    dateArray[2],
                    dateArray[3],
                    dateArray[4],
                    dateArray[5],
                    dateArray[6],
                    dateArray[7],
                    dateArray[8],
                    dateArray[9],
                    dateArray[10],
                    dateArray[11],
                    dateArray[12],
                    dateArray[13],
                    dateArray[14],
                    dateArray[15],
                    dateArray[16],
                    dateArray[17],
                    dateArray[18],
                    dateArray[19],
                    dateArray[20],
                    dateArray[21],
                    dateArray[22],
                    dateArray[23],
                    dateArray[24],
                        dateArray[25],
                        dateArray[26],
                        dateArray[27],
                        dateArray[28],
                        dateArray[29],
                        dateArray[30]
                ],
                datasets: [{
                        label: 'Orders/Day',
                        tension: 0.3,
                        fill: false,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(255, 51, 0)',
                        // data: [price[1],price[2],price[3],price[4],price[5],price[6],price[7],price[8],price[9],price[10],price[11],price[12],price[13],price[14],price[15],price[16],price[17],price[18],price[19],price[20],price[21],price[22],price[23],price[24],price[25],price[26],price[27],price[28],price[29],price[30],price[31]]
                   
                        data: [
                            countArray[0],
                            countArray[1],
                            countArray[2] ,
                            countArray[3],
                            countArray[4],
                            countArray[5],
                        countArray[6],
                        countArray[7],
                        countArray[8],
                        countArray[9],
                        countArray[10],
                        countArray[11],
                        countArray[12],
                        countArray[13],
                        countArray[14],
                        countArray[15],
                        countArray[16],
                        countArray[17],
                        countArray[18],
                        countArray[19],
                        countArray[20],
                        countArray[21],
                        countArray[22],
                        countArray[23],
                        countArray[24],
                        countArray[25],
                        countArray[26],
                        countArray[27],
                        countArray[28],
                        countArray[29],
                        countArray[30]
                    ]
                    
                    },
                    // {
                    //     label: 'Visitors',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(4, 209, 130, 0.2)',
                    //     borderColor: 'rgb(4, 209, 130)',
                    //     data: [40, 20, 17, 9, 23, 35, 39, 30, 34, 25, 27, 17]
                    // },
                    // {
                    //     label: 'Products',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    //     borderColor: 'rgb(380, 200, 230)',
                    //     data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
                    // }

                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } //End if

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ["900", "1200", "1400", "1600"],
            datasets: [
                {
                    label: "US",
                    backgroundColor: "#5897fb",
                    barThickness:10,
                    data: [233,321,783,900]
                }, 
                {
                    label: "Europe",
                    backgroundColor: "#7bcf86",
                    barThickness:10,
                    data: [408,547,675,734]
                },
                {
                    label: "Asian",
                    backgroundColor: "#ff9076",
                    barThickness:10,
                    data: [208,447,575,634]
                },
                {
                    label: "Africa",
                    backgroundColor: "#d595e5",
                    barThickness:10,
                    data: [123,345,122,302]
                },
            ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } //end if
}
    })
    
})(jQuery);