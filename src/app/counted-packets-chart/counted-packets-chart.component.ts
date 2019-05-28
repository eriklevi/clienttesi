import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import {CountedPacketsService} from '../_services/counted-packets.service';
import {AlertService} from '../_services/alert.service';
import {DataRequestService} from '../_services/data-request.service';
import {Subscription} from 'rxjs';
import {DataRequest} from '../_models/dataRequest';
import * as moment from 'moment';

@Component({
  selector: 'app-counted-packets-chart',
  templateUrl: './counted-packets-chart.component.html',
  styleUrls: ['./counted-packets-chart.component.css']
})
export class CountedPacketsChartComponent implements OnInit, OnDestroy {

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {xAxes: [{
        stacked: true
      }], yAxes: [{
        ticks: {
          min: 0
        }
      }]}
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataSets[] = [];
  dataReady = false;
  private subscription: Subscription;
  private resetChartSubscription: Subscription;

  constructor(
    private countedPacketsService: CountedPacketsService,
    private alertService: AlertService,
    private dataRequestService: DataRequestService
  ) { }

  ngOnInit() {
    this.subscription = this.dataRequestService.getRequestBehaviourSubject().subscribe(
      req => {
        if (req.valid) {
          this.loadData(req);
        }
      }, error => {
        console.log('errore!');
    });
    this.resetChartSubscription = this.dataRequestService.getResetChart()
      .subscribe(
        req => {
          this.barChartData = [];
          this.barChartLabels = [];
          this.dataReady = false;
        }
      );
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }


  loadData(req: DataRequest) {
    console.log(req);
    this.countedPacketsService.getCountedPacketsBySniffer(req.buildingId
      , req.roomId
      , req.snifferName
      , req.fromTimestamp
      , req.toTimestamp
      , req.resolution).subscribe(
        next => {
          console.log(next);
          this.barChartData = [{data: next.map(item => item.avgEstimatedDevices), label: req.snifferName}];
          this.barChartLabels = next.map( item => {
            return moment(item.startTimestamp).locale('it').format('llll').toString();
          });
          this.dataReady = true;
        },
      error => {
          this.alertService.error('Unable to fetch data!');
      }
    );
    console.log(this.barChartData);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.resetChartSubscription.unsubscribe();
  }
}
