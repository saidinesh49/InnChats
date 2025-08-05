import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  dialogRef: any;
  constructor(private dialog: MatDialog) {}
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
}
