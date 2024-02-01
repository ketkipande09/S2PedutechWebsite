import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ValidationService } from "./validation-messages.service";

@Component({
  selector: "validation-messages",
  templateUrl: "validation-messages.component.html",
  styleUrls: ["validation-messages.component.scss"]
})
export class ValidationMessagesComponent {
  
  @Input() control:any= FormControl;
  @Input()
  message: any;
  errorName: any;
  constructor(private validationService: ValidationService) { }

  get errorMessage() {
    // console.log(this.control);
    for (const propertyName in this.control.errors) {
      if (
        this.control.errors.hasOwnProperty(propertyName) && (this.control.dirty || this.control.touched)
        && this.control.invalid
      ) {
        return this.validationService.getValidatorErrorMessage(
          propertyName,
          this.control.errors[propertyName]
        );
      }
    }

    return null;
  }
}
