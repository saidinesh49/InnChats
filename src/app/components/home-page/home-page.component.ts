import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HashService } from 'src/app/services/hash-service.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';
import { friend } from 'src/app/Interfaces/friend.interface';
import { User } from 'src/app/Interfaces/user.interface';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  dialogRef: any;
  currentChatId: string = '';
  friendsList!: friend[];
  userData!: User;
  selectedUser!: any;

  constructor(
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private hashService: HashService,
    private authService: AuthService,
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.currentChatId = params['chatId'];
      console.log('chatId is:', this.currentChatId);
      if (this.currentChatId) this.validateUserForChatAccess();
    });
  }

  ngOnInit() {
    this.authService.userData.subscribe((userData) => {
      this.userData = userData;
    });
  }
  openAddFriendDialog() {
    this.dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: {
        message: 'Hii dialog box, this is from parent',
      },
      width: '400px',
    });

    this.dialogRef.afterClosed().subscribe((res: any) => {
      console.log(res);
    });
  }

  validateUserForChatAccess() {
    try {
      let users = this.hashService.decryptData(this.currentChatId)?.split('_');
      console.log('validated users are:', users);
      if (
        users &&
        users[0] != this.authService.userData.value?._id &&
        users[1] != this.authService.userData.value?._id
      ) {
        this.router.navigate([], {
          relativeTo: this.activatedRouter,
          queryParams: {},
        });
        return;
      }
    } catch (error) {
      console.log('Error at validate chat access:', error);
      this.router.navigate([], {
        relativeTo: this.activatedRouter,
        queryParams: {},
      });
    }
  }
}
