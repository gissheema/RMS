import { Component, OnInit ,Input, Output, EventEmitter} from '@angular/core';
import { UtilService } from '../../services/util.service';
import { CourseService } from '../../services/restservices';
import { CommonLabels } from '../../Constants/common-labels.var';

@Component({
  selector: 'app-filter-tab',
  templateUrl: './filter-tab.component.html',
  styleUrls: ['./filter-tab.component.css']
})
export class FilterTabComponent implements OnInit {
  @Input() selectedTab;
  parentResort ;
  parentResortId ;
  courseFilterList = [];
  parentDivisionFilterList = [];
  childResortFilterList = [];
  trainingClassFilterList = [];
  childDivisionFilterList = [];
  parentDepartmentFilterList = [];
  childDepartmentFilterList = [];
  createdByList = [];
  filterCourse = 'null';
  filterParentDivision = 'null';
  filterChildDivision = 'null';
  filterChildResort = 'null';
  filterTrainingClass = 'null';
  filterChildDepartment = 'null';
  filterParentDepartment = 'null';
  filterCreatedBy = 'null';
  filterCourseStatus = 'null';
  search = '';
  @Output() FilterSearchEvent = new EventEmitter<string>();
  

  constructor(private utilService : UtilService,private courseService : CourseService,public commonLabels : CommonLabels) { }

  ngOnInit() {
    let data = this.utilService.getUserData();
    if(data.ResortUserMappings.length){
      let resortDetails = data.ResortUserMappings;
      this.parentResort = resortDetails[0].Resort.resortName;
      this.parentResortId = resortDetails[0].Resort.resortId;
      this.getFilterData();
    }
  }

  getFilterData(){
    let userId = this.utilService.getUserData().userId;
    let query = '?created='+userId;
    this.courseService.getAllCourse(query).subscribe(result=>{
      if(result && result.isSuccess){
        this.courseFilterList = result.data && result.data.rows;
      }
    })
    this.courseService.getDivision(this.parentResortId,'parent').subscribe(result=>{
      if(result && result.isSuccess){
        this.parentDivisionFilterList = result.data && result.data.divisions;
      }
    })
    this.courseService.getChildResort(this.parentResortId).subscribe(result=>{
      if(result && result.isSuccess){
        this.childResortFilterList = result.data  && result.data.Resort;
      }
    })
    this.courseService.getCreatedByDetails().subscribe(result=>{
      if(result && result.isSuccess){
        this.createdByList = result.data  && result.data;
      }
    })
  }
  courseChange(courseId){
    this.filterTrainingClass = 'null';
    this.courseService.getTrainingclassesById(courseId).subscribe(result=>{
      if(result && result.isSuccess){
        this.trainingClassFilterList = result.data && result.data.length && result.data;
      }
    })
  }
  

  divisionChange(divisionId,type){
    let id = type === 'parent' ? this.filterParentDivision : this.filterChildDivision;
    this.courseService.getDepartment(id).subscribe(result=>{
       if(type === 'parent'){
        this.parentDepartmentFilterList = result.data.rows && result.data.rows.length && result.data.rows;
      }
      else if(type === 'child'){
        this.childDepartmentFilterList = result.data.rows && result.data.rows.length && result.data.rows;
      }
      
    })
  }

  childResortChange(resortId){
   
    this.courseService.getDivision(this.filterChildResort,'parent').subscribe(result=>{
      if(result && result.isSuccess){
        this.childDivisionFilterList = result.data.divisions && result.data.divisions.length ? result.data.divisions : [];
        console.log(this.childDivisionFilterList);
      }
    })
  }
  submitForm(data){
    let formValues = data.form.value;
    this.FilterSearchEvent.emit(formValues);
  }

  resetFilter(){
    this.courseFilterList = [];
    this.parentDivisionFilterList = [];
    this.childResortFilterList = [];
    this.trainingClassFilterList = [];
    this.childDivisionFilterList = [];
    this.parentDepartmentFilterList = [];
    this.childDepartmentFilterList = [];
    this.createdByList = [];
    this.filterCourseStatus = 'null';
    this.filterCourse = 'null';
    this.filterParentDivision = 'null';
    this.filterChildDivision = 'null';
    this.filterChildResort = 'null';
    this.filterTrainingClass = 'null';
    this.filterChildDepartment = 'null';
    this.filterParentDepartment = 'null';
    this.filterCreatedBy = 'null';
    this.search = '';

    this.getFilterData();
    
    this.FilterSearchEvent.emit(null);
  }
}
