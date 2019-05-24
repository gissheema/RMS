import { Component, OnInit, TemplateRef,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,Content } from 'ionic-angular';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Constant } from '../../constants/Constant.var';
import { ToastrService } from '../../service/toastrService';
import { API_URL } from '../../constants/API_URLS.var';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { ModalPage } from '../modal/modal';
import { LoaderService} from '../../service';
import * as moment from 'moment';


@IonicPage({
  name: 'forumdetail-page'
})
@Component({
  selector: 'page-forum-detail',
  templateUrl: 'forum-detail.html',
})
export class ForumDetailPage implements OnInit {

  @ViewChild(Content) content: Content;

  forumTopics: any;
  QuestionForm: FormGroup;
  forum = {
    'question': ''
  }
  forumDetailObject;
  indexs;
  employees;
  topics;
  forumId;
  editComment;
  commentId;
  editDisable=true;
  forumFavor: any = [];
  forumRecent: any = [];
  forumFeature: any = [];
  recentList: any = [];
  favoriteList: any = [];
  featureList: any = [];
  commentList: any = [];
  like: boolean = false;
  currentUser;
  userId;
  comment;
  createdBy;
  description;
  postId;
  status;
  hideQuestionBtn:boolean = true;
  constructor(public navCtrl: NavController,public loader: LoaderService,public navParams: NavParams, private modalService: BsModalService, public constant: Constant, private toastr: ToastrService, public API_URL: API_URL, private http: HttpProvider, private storage: Storage, public modalCtrl: ModalController) {
    this.forumDetailObject = this.navParams.data;
    //this.employees = this.forumDetailObject['setData']['employees'];
    this.topics = this.forumDetailObject['setData']['topics'];
    this.forumId = this.forumDetailObject['setData']['forumId'];
    this.indexs = this.forumDetailObject['selectedIndex'];
  }
  ionViewDidLoad() {
    this.forumTopics = 'mostRecent';
  }
  ionViewDidEnter() {
    this.status='recent';
    this.getTopicsRelated();
    
  }

  calculateExpireDays(dueDate) {
    const a = moment(new Date());
    const b = moment(new Date(dueDate));
    return b.to(a, true);
  }

  ngOnInit() {
    this.forumTopics = 'mostRecent';
    this.QuestionForm = new FormGroup({
      question: new FormControl('', [Validators.required])
    });
    this.getUser();
    //this.getComments();
  }
  getTopicsRelated() {

    this.loader.showLoader();
    this.http.get(API_URL.URLS.post+'?forumId='+this.forumId+'&status='+this.status).subscribe((res) => {
      if (res['isSuccess']) {
        this.recentList = res['data'];
      }else{
        this.recentList=[];
      }
      this.loader.hideLoader();
    });
  }
  modalRef: BsModalRef;
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  openEditModal(template: TemplateRef<any>, comment){
       this.editComment = comment.description;
       this.commentId = comment.commentId;
       this.postId= comment.postId;
       this.description = comment.description;
       this.createdBy =comment.createdBy;
       this.modalRef = this.modalService.show(template);
  }

  changeEditInput(){
    this.editDisable = false;
  }

  updateComment(){
    let postData = {
       'description' : this.editComment,
       'postId': this.postId,
       'createdBy':this.createdBy
    }
    this.http.put(false,API_URL.URLS.comment+'/'+ this.commentId,postData).subscribe(res=>{
      if(res['isSuccess']){
        this.toastr.success(res['data']);
        this.modalRef.hide();
        this.getTopicsRelated();
      }
    })
  }
  
  //Add post
  questionSubmit() {
    let postData={
      "description" : this.forum.question,
      "forumId": this.forumId,
      "createdBy": this.currentUser.userId,
      "votesCount": 0
    }
    this.loader.showLoader();
    this.http.post(false,API_URL.URLS.post,postData).subscribe(res=>{
       if(res['isSuccess']){
         this.toastr.success(res['data']);
          this.getTopicsRelated();
          this.forum.question = '';
          this.modalRef.hide();
       }
     this.loader.hideLoader();  
    })
    
  }

 //change status between recent and fav.
  changeStatus(status){
    this.status = status;
    this.getTopicsRelated();
  }

  //Make a post fav/unfav
  likeUnlikeQuestion(list, status) {
    list['like'] = !(list['like']);
    let postData={
      'isFavorite': status
    }
    this.loader.showLoader();
    this.http.put(false,API_URL.URLS.post+'/'+list.postId,postData).subscribe((res) => {
      if (res['isSuccess']) {
        this.toastr.success(res['data']);
        this.getTopicsRelated();
      }
      this.loader.hideLoader();
    });
  }

 //hide and show description part
  hideShowDesc(list, j) {
    this.hideQuestionBtn = true;
    list[j]['isActive'] = !(list[j]['isActive']);
    list[j]['isComment'] = list[j]['isComment'] ? false :'';
  }

  //hide and show comment part
  showCommentSet(list, j) {
    this.getComments(list[j]['postId']);
    list[j]['isComment'] = !(list[j]['isComment']);
    this.hideQuestionBtn = false ;
  }
  
  //Get comments by postId
  getComments(id) {
    this.http.get(API_URL.URLS.comment+'/'+id).subscribe((res) => {
      if (res['isSuccess']) {
        this.commentList = res['data']['rows'];
      }
    });
  }
  
  getUser() {
    this.storage.get('currentUser').then(
      (val) => {
        if (val) {
          this.currentUser = val;
          this.userId = this.currentUser.userId;
        }
      }, (err) => {
        console.log('currentUser not received in forum-detail.component.ts', err);
      });
  }

  saveComment(id,i) {  
   let postData ={
     "description": this.comment,
     "createdBy" : this.currentUser.userId,
     "postId": id
   }
     if (!this.comment) {
      this.toastr.error("Comment is required");
    } else {
      this.http.post(false,API_URL.URLS.comment,postData).subscribe(res=>{
        if(res['isSuccess']){
          this.recentList[i]['isComment'] = true;
          this.getComments(id);
          this.toastr.success(res['data']);
           this.comment = '';
        }
      })  
    }
  }

  likePost(list,status){
    let postData={};
    
    if(status == 'like'){
      list['like'] = true;
      postData['votesCount'] = list.votesCount + 1;
    }

    this.http.put(false,API_URL.URLS.post+'/'+list.postId, postData).subscribe(res=>{
      if(res['isSuccess']){
        this.getTopicsRelated();
      }
    })
  }

  deleteComment(){
    this.http.delete(API_URL.URLS.comment+'/'+this.commentId).subscribe(res=>{
      if(res['isSuccess']){
        this.toastr.success(res['data']);
        this.modalRef.hide();
        this.getTopicsRelated();
      }
    })
  }

  async presentModal(repliesObj) {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: { value: repliesObj }
    });
    return await modal.present();
  }
  goBackLevel(){
    this.navCtrl.setRoot('forum-page');
  }
}
