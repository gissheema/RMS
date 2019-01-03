import { Component, OnInit } from '@angular/core';
import {DashboardVar} from '../../Constants/dashboard.var';
import {HttpService} from '../../services/http.service';
declare var require: any;
const Highcharts = require('highcharts');
import Chart from 'chart.js';
import { API_URL } from 'src/app/Constants/api_url';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resort-charts',
  templateUrl: './resort-charts.component.html',
  styleUrls: ['./resort-charts.component.css']
})
export class ResortChartsComponent implements OnInit {
    donutChartData = [];
    donutEnable = false;
    Badges = [];
    BadgesCertificate = [];
    todayDate;

  constructor(private dashboardVar: DashboardVar, private http: HttpService,private route:Router) {
    this.dashboardVar.url=API_URL.URLS;
   }

  ngOnInit() {
   //get Task stackbar chart data
    this.http.get(this.dashboardVar.url.getTaskResortChart).subscribe((data) => {
        this.dashboardVar.taskChart = data.Tasks;
   })

   //get Feedback & Rating data
   this.http.get(this.dashboardVar.url.getFeedbackRating).subscribe((data) => {
    this.dashboardVar.feedbackData = data;
  })
 
  this.http.get(this.dashboardVar.url.getResortList).subscribe((data) => {
    this.dashboardVar.resortList = data.resortList;
  })

  this.http.get(this.dashboardVar.url.getvisitorsByResorts).subscribe((data) => {
    this.dashboardVar.visitorsResort = data.resorts;
  })

    this.topResorts();
    this.badgesCertification();
    this.getKeyStat();
    setTimeout(() => {
    this.visitorsByResortPie();
    this.visitorsLineChart();
    this.staffLineChart();
    this.totalEmployeeLineChart();
    this.taskStackbar();
    this.feedbackrating();
    this.reservationByResort();
    }, 1000);
  }

  getKeyStat() {
    this.http.get(this.dashboardVar.url.getKeyStat).subscribe((data) => {
        const keyStat= data;
        this.dashboardVar.newEmployee=keyStat.NewEmployees;
        this.dashboardVar.weekGrowth=keyStat.WeeklyGrowth;
        this.dashboardVar.recentComments=keyStat.RecentComments;

      });
  }


  topResorts() {
    this.http.get(this.dashboardVar.url.getTopResorts).subscribe((data) => {
      this.dashboardVar.topResorts = data.resortCharts.TopResorts;
    });
  }

  badgesCertification() {
    this.http.get(this.dashboardVar.url.getBadgesAndCertification).subscribe((data) => {
        this.dashboardVar.badgesCertification = data;
        this.Badges = this.dashboardVar.badgesCertification.Badges;
        this.BadgesCertificate = this.dashboardVar.badgesCertification.Certification;
      });
  }

  visitorsLineChart() {
  Highcharts.chart('visitors', {
     credits: {
      enabled: false
  },
  chart: {
      type: 'area'
  },
  xAxis: {
    labels: {enabled: false}
  },
  yAxis: {
    labels: {
           enabled: false
             },
    title: {
            text :null
            },
    gridLineColor: 'transparent',
    min: 0,
    max: 10
  },
   title: {
    style: {
        display: 'none'
    }
    },
    legend: {
    enabled: false,
    },
  plotOptions: {
       series: {
         marker: {
          enabled: true,
          symbol: 'circle',
          radius: 2,
          fillColor: '#ffffff',
          lineColor: '#000000',
          lineWidth: 1

        },
        fillColor : {
          linearGradient : [0, 0, 0, 300],
          stops : [
            [0, 'rgb(8,73,98)'],
            [1, 'rgb(41,136,180)']
          ]
        }
      }
  },
  series: [{
    // data: [0, 7.0, 5, 9, 8.3, 9.3, 6.8, 7.7, 6, 0]
    data: [0, 5, 3.3, 4, 3.7, 5.5  , 4, 4.5, 5, 0 ]
  }]
});
}

staffLineChart() {
    Highcharts.chart('staff', {
       credits: {
      enabled: false
  },
    chart: {
        type: 'area'
    },
    xAxis: {
      labels: {enabled: false}
    },
    yAxis: {
      labels: {
             enabled: false
               },
     title: {
                text :null
              },
      gridLineColor: 'transparent',
      min: 0,
      max: 10
    },
     title: {
    style: {
        display: 'none'
    }
    },
    legend: {
    enabled: false,
    },
    plotOptions: {
         series: {
             marker: {
          enabled: true,
          symbol: 'circle',
          radius: 2,
          fillColor: '#ffffff',
          lineColor: '#000000',
          lineWidth: 1

        },
          fillColor : {
            linearGradient : [0, 0, 0, 300],
            stops : [
              [0, 'rgb(8,73,98)'],
              [1, 'rgb(41,136,180)']
            ]
          }
        }
    },
    series: [{
      data: [0, 1.5, 1.5, 3, 3, 3, 0  ]
    }]
  });
  }

totalEmployeeLineChart() {
    Highcharts.chart('totalemployee', {
        credits: {
      enabled: false
  },
    chart: {
        type: 'area'
    },
        title: {
    style: {
        display: 'none'
    }
    },
    legend: {
    enabled: false,
    },
    xAxis: {
      labels: {enabled: false}
    },
    yAxis: {
      labels: {
             enabled: false
               },
      title: {
           text : null
      },
      gridLineColor: 'transparent',
      min: 0,
      max: 10
    },
    plotOptions: {
         series: {
          fillColor : {
            linearGradient : [0, 0, 0, 300],
            stops : [
              [0, 'rgb(8,73,98)'],
              [1, 'rgb(41,136,180)']
            ]
          }
        }
    },
    series: [{
      data: [0, 2, 1.3, 3, 2.3, 3.3, 0.8, 1.7, 1, 0  ]
    }]
  });
  }

feedbackrating() {
   const canvas: any = document.getElementById('rating');
   const ctx = canvas.getContext('2d');
  const  options={
    legend: {
        display: false,
    },
    scales: {
      yAxes: [{
        gridLines: {
          drawBorder: false,
        },
      }],
      xAxes: [{
        display: false,
        gridLines: {
          display: false,
        },
      }]
    }
  }
   const horizontalBarChartData = {
    labels: ['5', '4', '3', '2', '1'],
    datasets: [{
        backgroundColor: ['#9FC05A','#ADD633','#F6D834','#F3B335','#F18C5A'],
        data: this.dashboardVar.feedbackData.data
    }],
   };

   const myBarChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: horizontalBarChartData,
        options : options

    });
}

taskStackbar() {
    Highcharts.chart('task', {
       credits: {
      enabled: false
  },
      chart: {
          type: 'column'
      },
       title: {
       text: '',
    style: {
        display: 'none'
    }
    },
    subtitle: {
         text: '',
    style: {
        display: 'none'
    }
    },
      // title: {
      //     text: 'Stacked column chart'
      // },
      xAxis: {
          categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      },
      yAxis: {
          min: 0,
          max: 100,
          // title: {
          //     text: 'Total fruit consumption'
          // },
          stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color: 'gray'
              }
          }
      },
      legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'top',
          y: 25,
          floating: true,
          backgroundColor: 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false
      },
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: false,
                  color: 'white'
              }
          }
      },
      series: this.dashboardVar.taskChart
    });
}
visitorsByResortPie() {

    Highcharts.chart('visitorsByResort', {
       credits: {
      enabled: false
  },
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
          title: {
       text: '',
    style: {
        display: 'none'
    }
    },
    subtitle: {
         text: '',
    style: {
        display: 'none'
    }
    },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: this.dashboardVar.visitorsResort
        }]
    });
}

reservationByResort() {
    this.http.get(this.dashboardVar.url.getReservationByResort).subscribe((resp) => {
        const donutChartData = resp.ReservationByResort;
        this.donutEnable = true;
        const labels = donutChartData.labels;
      const data_values = donutChartData.data_values;

      const data = data_values.map(function(value, index) {
        return { name: labels[index], y: value };
      }, []);

        Highcharts.chart('chartContainer', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
              text: '',
          },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },

            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    innerSize: '60%',
                     cursor: 'pointer',
                     indexLabelFontSize: 12,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                      connectorColor: 'black',
                      style: {
                        fontWeight: 'normal',
                        fontSize: '10px',
                    }
                  }
                }
            },
            xAxis: {
                categories: labels
            },
            series: [{
                name: '',
                data: data
            }],
            credits: {
              enabled: false
            }
        }
        );
    });
}
addQuickTasks(){
    this.todayDate = new Date();
    localStorage.setItem('BatchStartDate',this.todayDate);
    this.route.navigateByUrl('/addBatch');
  }

}
