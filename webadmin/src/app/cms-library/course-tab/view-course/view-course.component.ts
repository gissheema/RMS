import { Component, OnInit, ViewChild ,TemplateRef} from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { HeaderService, HttpService, CourseService, CommonService, AlertService, UtilService, BreadCrumbService, FileService, PermissionService } from '../../../services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap';
import { CommonLabels } from '../../../Constants/common-labels.var';
import { Location } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-view-course',
  templateUrl: './view-course.component.html',
  styleUrls: ['./view-course.component.css']
})
export class ViewCourseComponent implements OnInit {
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  courseId;
  courseDetails = [];
  classId;
  tabIndex = 0;
  uploadPath;
  videoUrl;
  modalRef: BsModalRef;
  approvalForm:boolean = true;

  constructor(private headerService: HeaderService, private breadCrumbService: BreadCrumbService, private activatedRoute: ActivatedRoute, private courseService: CourseService, public commonLabels: CommonLabels, private modalService: BsModalService, private commonService: CommonService, private alertService: AlertService, private utilService: UtilService, private route: Router, private fileService: FileService, private permissionService: PermissionService, private _location: Location) {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.courseId = params['id'];
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if(params.type === 'approval'){
        this.approvalForm = false;
      }
    });
  }

  ngOnInit() {
    this.headerService.setTitle({ title: 'Edit', hidemodule: false });
    let breadCrumbTitle = [{ title: this.commonLabels.labels.edit, url: '/cms-library' }, { title: this.commonLabels.labels.course, url: '' }]
    this.breadCrumbService.setTitle(breadCrumbTitle);
    this.courseId && this.getCourseDetails('', this.tabIndex);
  }

  getCourseDetails(type, i) {
    this.courseService.getAllCourseDetails(this.courseId).subscribe(resp => {
      if (resp && resp.isSuccess) {
        this.courseDetails = resp.data.course ? resp.data.course : [];
        this.uploadPath = resp.data.uploadPaths.uploadPath;
        this.classId = this.courseDetails.length && this.courseDetails[0].TrainingClass && this.courseDetails[0].TrainingClass.trainingClassId ? this.courseDetails[0].TrainingClass.trainingClassId : '';
        if (type == 'update' && this.courseDetails.length > 1) {
          this.classTabSelect(i + 1);
        }
      }
    }, err => {
      this.alertService.error(err.error.error)
    })
  }
  openFileContent(template,fileUrl) {
    let extn = fileUrl.split('.').pop();
    extn = extn.toLowerCase();
    let videoExtensions = ['mp4','m4a', 'm4v', 'f4v', 'f4a', 'm4b', 'm4r', 'f4b', '3gp', '3gp2', '3g2', '3gpp', '3gpp2','ogg', 'oga', 'ogv', 'ogx','mov','wmv','flv','avi','avchd','webm'];
    if (videoExtensions.includes(extn)){
      this.viewTraningVideo(template,fileUrl);
    }else{
      let url = this.uploadPath + fileUrl;
      window.open(url, "_blank");
    }
  }
  viewTraningVideo(template: TemplateRef<any>, videourl) {
    let modalConfig={
      class:"modal-lg video-box"
    }
    this.modalRef = this.modalService.show(template, modalConfig);
    this.videoUrl = videourl;
  }

  goToCourse() {
    this.route.navigate(['/cms-library'], { queryParams: { type: "create", tab: 'course', 'moduleId': this.courseId, "preview": true, "previewId": this.classId } });
  }
  classTabSelect(index) {
    this.tabIndex = index;
    this.classId = this.courseDetails.length && this.courseDetails[index].TrainingClass && this.courseDetails[index].TrainingClass.trainingClassId ? this.courseDetails[index].TrainingClass.trainingClassId : '';
  }
  updateClass(classId, i) {
    if(this.approvalForm)
    {
      let user = this.utilService.getUserData();
      let resortId = user.ResortUserMappings.length ? user.ResortUserMappings[0].Resort.resortId : null;
      let data = this.courseDetails[i]
      let params = {
        "trainingClassName": data.trainingClassName,
        "files": [],
        "createdBy": user.userId,
        "quizName": data.TrainingClass.QuizMappings.length ? data.TrainingClass.QuizMappings[0].Quiz.quizName : '',
        "quiz": {},
        "trainingClassId": data.trainingClassId,
        "quizQuestions": [],
        "resortId": resortId,
        "noQuiz": 1
      }
  
      if (data.TrainingClass.QuizMappings.length) {
        delete params.noQuiz;
        params.quiz = {
          "quizId": data.TrainingClass.QuizMappings[0].Quiz.quizId,
          "quizName": data.TrainingClass.QuizMappings[0].Quiz.quizName
        }
        params.quizQuestions = data.TrainingClass.QuizMappings[0].Quiz.Questions.map((item, i) => {
          item.order = i + 1;
          return item
        })
      }
      else {
        delete params.quiz;
        delete params.quizQuestions;
      }
  
      if (data.TrainingClass.FileMappings.length) {
        params.files = data.TrainingClass.FileMappings.map((item, i) => {
          item.File.order = i + 1;
          return item
        })
      }

      this.courseService.updateTrainingClass(classId, params).subscribe((result) => {
        if (result && result.isSuccess) {
          if (this.courseDetails.length == 1 || this.courseDetails.length - 1 == this.tabIndex) {
            this._location.back();
            this.alertService.success('Training Class updated successfully');
          } else {
            this.getCourseDetails('update', i);
          }
        }
      },(err) =>{
       this.alertService.error(err.error.error.message);
      })
    }else{
      alert("here");
      this.route.navigateByUrl('/approvalrequests');
    }
  }
}
