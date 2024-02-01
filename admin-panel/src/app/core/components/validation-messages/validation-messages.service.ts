import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  FormControl,
  ValidatorFn,
} from '@angular/forms';

@Injectable()
export class ValidationService {
  constructor() {}

  getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config: any = {
      required: 'This field is required',
      invalidCreditCard: 'Is invalid card number',
      invalidAadharCard: 'invalid aadhar  number',
      email: 'Invalid email address',
      invalidEmailAddress: 'Invalid email address',
      invalidMobile: 'Invalid Mobile no',
      numericAllowed: 'Only numeric values are allowed',
      invalidPassword:
        'Invalid password. Password must be at least 6 characters long, and contain a number.',
      minlength: `Minimum length ${validatorValue.requiredLength}`,
      maxlength: `Max length ${validatorValue.requiredLength}`,
      mustMatch: 'Passwords must match',
      invalidDob: 'User must be minimum 16 Years old.',
      invalidUrl: 'Invalid URL',
      alphaNumericAllowed: 'Only apha numeric input is allowed',
      alphaAllowed: 'Please enter letters.',
      fromToDate: `To Date Should be Greater than From Date`,
      LessThanToday: `Date shouldn't be greater than today's`,
    };
    return config[validatorName];
  }

  static creditCardValidator(control: AbstractControl) {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    if (
      control.value.match(
        /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/
      )
    ) {
      return null;
    } else {
      return { invalidCreditCard: true };
    }
  }
  // aadharCardValidator(control: AbstractControl) {
  //   if (control.value && control.value.match(/^\d{12}$/)) {
  //     return null;
  //   } else {
  //     return { 'invalidAadharCard': true };
  //   }
  // }
  emailValidator(control: AbstractControl) {
    // RFC 2822 compliant regex
    // tslint:disable-next-line:max-line-length
    if (
      control.value &&
      control.value.match(
        /[a-z0-9!#$%&"*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&"*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      )
    ) {
      return null;
    } else {
      return { invalidEmailAddress: true };
    }
  }

  mobileValidator(control: any) {
    // RFC 2822 compliant regex
    // console.log(control.value, 'mobileValidation');

    if (control.value) {
      control.value = String(control.value);
    }
    // console.log(typeof control.value);

    if (control.value && control.value.match(/^\d{10}$/)) {
      return null;
    } else {
      return { invalidMobile: true };
    }
  }
  alphaValidator(control: AbstractControl) {
    if (control.value == null || control.value.match(/^[a-zA-Z\s]*/)) {
      return null;
    } else {
      return { alphaAllowed: true };
    }
  }

  static numberValidator(control: AbstractControl) {
    if (control.value.length == 0 || control.value.match(/^[0-9]*$/)) {
      return null;
    } else {
      return { numericAllowed: true };
    }
  }
  alpaNumValidator(control: AbstractControl) {
    if (control.value.match(/^[a-zA-Z0-9]*$/)) {
      return null;
    } else {
      return { alphaNumericAllowed: true };
    }
  }
  // function to validate that dob should be 16 years old
  // static dobValidator(control: AbstractControl) {
  //   let currentDate = new Date();
  //   if (control.value) {
  //     let dob = new Date(control.value);
  //     let dobYear = dob.getFullYear();
  //     let maxDobYear = currentDate.getFullYear() - 16;
  //     //console.log(dobYear, maxDobYear)
  //     if (maxDobYear < dobYear) {
  //       return { 'invalidDob': true };
  //     }
  //     else {
  //       return null
  //     }
  //   }
  // }

  static urlValidator(control: AbstractControl) {
    const URL_REGEXP =
      /^(http?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|in|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    if (control.value.match(URL_REGEXP)) {
      return null;
    } else {
      return { invalidUrl: true };
    }
  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        // return if another validator has already found an error on the matchingControl
        return;
      }
      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  LessThanToday(control: any) {
    let today: Date = new Date();
    if (new Date(control.value) > today) {
      return { LessThanToday: true };
    } else {
      return null;
    }
  }

  specialCharacter(control: any) {
    const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (control.value && nameRegexp.test(control.value)) {
      return { invalidName: true };
    } else {
      return null;
    }
  }

  noWhitespaceValidator(control: any) {
    let value = control.value || '';
    if (value) {
      value = value.toString().replace(/\s/g, '');
    }
    return value == '' ? { whitespace: true } : null;
  }

  // fromToDate(
  //   fromDateField: string,
  //   toDateField: string,
  //   errorName: any = 'fromToDate'
  // ): ValidatorFn {
  //   return (formGroup: FormGroup) => {
  //     const fromDate = formGroup.controls[fromDateField];
  //     const toDate = formGroup.controls[toDateField];
  //     let from = null;
  //     let to = null;
  //     if (fromDate.value && fromDate.value.year && fromDate.value.month && fromDate.value.day) {
  //       from = new Date(`${fromDate.value.year}-${fromDate.value.month}-${fromDate.value.day}`);
  //     }
  //     if (toDate.value && toDate.value.year && toDate.value.month && toDate.value.day) {
  //       to = new Date(`${toDate.value.year}-${toDate.value.month}-${toDate.value.day}`);
  //     }
  //     if (
  //       fromDate !== null &&
  //       toDate !== null && from && to &&
  //       to.getTime() < from.getTime()
  //     ) {
  //       toDate.setErrors({ fromToDate: true });
  //     }
  //     return null;
  //   };
  // }

  // LessThanToday(control: FormControl): { [key: string]: any } {
  //   let today: Date = new Date();
  //   if (new Date(control.value) > today) return { LessThanToday: true };
  //   return null;
  // }
}
