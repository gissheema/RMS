import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService ,UtilService,ResortService,BreadCrumbService,CommonService,UserService} from '../services';
import { CommonLabels} from '../Constants/common-labels.var';
import { BatchVar } from '../Constants/batch.var';

@Component({
  selector: 'app-approvalrequests',
  templateUrl: './approvalrequests.component.html',
  styleUrls: ['./approvalrequests.component.css']
})

export class ApprovalrequestsComponent implements OnInit {
  resortId;
  userData;
  selectedResort;
  selectedDivision = [];
  selectedDepartment = [];
  selectedEmp = [];
  divisionList = [];
  resortList = [];
  departmentList = [];
  employeeList = [];
  submitted = false;

  constructor(private headerService:HeaderService,
    public commonLabels : CommonLabels,
    private breadCrumbService:BreadCrumbService,
    private utilService :UtilService,
    private resortService : ResortService,
    private commonService : CommonService,
    private userService : UserService,
    public batchVar : BatchVar) { }

  ngOnInit() {
    this.headerService.setTitle({title:'Approval Request', hidemodule:false});
    this.breadCrumbService.setTitle([]);
    this.userData = this.utilService.getUserData();
    this.resortId = this.userData.ResortUserMappings.length && this.userData.ResortUserMappings[0].Resort.resortId;
    this.getResortData(this.resortId);
  }

  getResortData(resortId) {
    this.resortService.getResortByParentId(resortId).subscribe((result) => {
        (this.resortId == parseInt(resortId)) ? this.resortList = result.data.Resort : '';
        this.divisionList = result.data.divisions;
        this.selectedResort = resortId;
    })
  }

  onEmpAllSelect(event, key) {
    if (key == 'div') {
        this.batchVar.selectedDivision = event;
        this.onEmpSelect('', 'div');
        if (!event.length) {
            this.batchVar.departmentList = [];
            this.batchVar.employeeList = [];
        }
    }
    if (key == 'dept') {
        this.batchVar.selectedDepartment = event;
        this.onEmpSelect('', 'dept');
        if (!event.length) {
            this.batchVar.employeeList = [];
        }
    }
    if (key == 'emp') {
        this.batchVar.selectedEmp = event;
        this.onEmpSelect(event, 'emp')
    }
  }

  onEmpSelect(event, key) {
    this.batchVar.employeeId = this.selectedEmp.map(item => { return item.userId });
    this.batchVar.departmentId = this.selectedDepartment.map(item => { return item.departmentId });
    this.batchVar.divisionId = this.selectedDivision.map(item => { return item.divisionId });
    this.getDropDownValues(event, key);
    // this.batchVar.empValidate = false;
  }

  getDropDownValues(event, key) {
    if (key == 'div') {
      const obj = { 'divisionId': this.batchVar.divisionId };
      this.commonService.getDepartmentList(obj).subscribe((result) => {
          if (result.isSuccess) {
              this.departmentList = result.data.rows;
          }
      })
    }

    if (key == 'dept') {
      const data = { 'departmentId': this.batchVar.departmentId, 'createdBy': this.utilService.getUserData().userId }
      this.userService.getUserByDivDept(data).subscribe(result => {
          if (result && result.data) {
              this.employeeList = result.data;
          }
      })
    }
  }

  submitRequest(){
    this.submitted = true;
  }

}
