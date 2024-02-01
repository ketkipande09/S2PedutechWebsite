import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from 'src/app/Services/client-services/client.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  selectedRow: any = {};
  s: any; 
  constructor( private router: Router,
    private clientService : ClientService,
    private modalService:NgbModal,
   ) { }

  ngOnInit(): void {
   this.getAllClient();
  }
  clientiterate :any = [];

  getAllClient() {
    this.clientService.getAllClient().subscribe((data: any) => {
      this.clientiterate  = data.result.client;
      console.log("aara", this.clientiterate )
    });
  }

  open(s: any, content: any){
    this.selectedRow = s;
    console.log('this.selectedRow',this.selectedRow);
    this.modalService.open(content, {centered: true})
    
  }


  deleteClient(id: any) {
    
    this.clientService.deleteClient(id).subscribe(
      (success: any) => {
        
        const index = this.clientiterate.findIndex((client: any) => client.id === id);
        if (index !== -1) {
          this.clientiterate.splice(index, 1);
        }
        console.log("Client Deleted successfully", success);
        this.modalService.dismissAll();
       
      },
      (error) => {
        console.log("Error in deleting Client", error);
      }
    );
  }

  edit(client :any){
    
    this.router.navigate(['user/client-form'],{
      queryParams:{
          id :client.id,
      }
    })
  }



  add(){
    this.router.navigate(['/user/client-form'])
  }
}
