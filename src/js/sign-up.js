import handlebars from 'handlebars';
import queryString from 'query-string';
import {
  AUTH_FIELD,
  ERROR_MESSAGES_EN,
  ERROR_MESSAGES_PT,
  generateId,
  prepareInputMask,
  registerUser,
  validatePhone,
} from 'mayanbet-sdk';
import signUpFormTemplate from '@/partials/sign-up-form.hbs?raw';

export class SignUpForm {
  formRef = null;
  isValid = false;
  isVisiblePassword = false;
  isSubmitLoading = false;
  submitCallback = null;

  constructor({ formRef, submitCallback = null }) {
    this.formRef = formRef;
    this.submitCallback = submitCallback;

    prepareInputMask(this.formRef);

    [
      this.formRef[AUTH_FIELD.tel],
      this.formRef[AUTH_FIELD.email],
      this.formRef[AUTH_FIELD.password],
    ].forEach(ref => {
      ref.addEventListener('input', this.onInput.bind(this));
    });
    this.formRef.agreeCheck.addEventListener(
      'change',
      this.onChangeCheckbox.bind(this),
    );
    this.formRef.addEventListener('submit', e => this.onSubmit.bind(this)(e));

    const hidePasswordBtnRefs = this.formRef.querySelectorAll(
      '.js-password-input-btn',
    );
    [...hidePasswordBtnRefs].forEach(ref => {
      ref.addEventListener('click', this.togglePasswordVisibility);
    });
  }

  validate() {
    const { tel, email, password, submitBtn, agreeCheck } = this.formRef;
    if (!email || !password || !agreeCheck || !submitBtn) return;
    const onlyNumbersRegex = new RegExp('\\d');

    let isValid =
      email.validity.valid &&
      onlyNumbersRegex.test(tel.value[tel.value.length - 1]) &&
      password.validity.valid &&
      agreeCheck.checked;

    this.isValid = isValid;

    if (isValid) {
      submitBtn.classList.remove('app-button--disabled');
    } else {
      submitBtn.classList.add('app-button--disabled');
    }
  }

  onInput = () => {
    this.validate();
  };

  onChangeCheckbox = () => {
    this.validate();
  };

  onSubmit = async event => {
    event.preventDefault();

    const searchString = queryString.parse(window.location.search);

    try {
      if (!this.isValid || this.isSubmitLoading) return;

      this.isSubmitLoading = true;
      this.formRef.fieldset.disabled = true;
      this.formRef.submitBtn.classList.add('loading');

      const rawPhone = this.formRef[AUTH_FIELD.tel].value;
      const phone = `55${rawPhone}`;

      const { valid } = await validatePhone(phone);

      if (!valid) {
        throw new Error(ERROR_MESSAGES_PT.invalidPhone);
      }

      const body = {
        email: this.formRef[AUTH_FIELD.email].value,
        password: this.formRef[AUTH_FIELD.password].value,
        phone,
        nickname: generateId(),
        currency: 'BRL',
        country: 'BR',
        affiliateTag: searchString.click_id ?? '',
        bonusCode: searchString.bonus_code ?? '',
      };

      let responseData = null;

      responseData = (await registerUser(body)).data;

      await this.submitCallback?.();

      searchString.state = responseData?.autologinToken;
      const stringifiedSearch = queryString.stringify(searchString);

      window.location.replace(
        `${
          import.meta.env.VITE_REDIRECT_URL
        }/auth/autologin/?${stringifiedSearch}`,
      );
    } catch (error) {
      const errorMessages = [];

      if (error.response) {
        const validationErrors = error.response?.data?.error?.fields;
        if (validationErrors) {
          errorMessages.push(Object.values(validationErrors).flat());
        }
      } else {
        errorMessages.push([error.message]);
      }

      if (
        errorMessages.some(
          ([message]) =>
            message === ERROR_MESSAGES_EN.emailExist ||
            message === ERROR_MESSAGES_EN.phoneExist,
        )
      ) {
        searchString['wallet'] = 'deposit';
        const stringifiedSearch = queryString.stringify(searchString);

        window.location.replace(
          `${import.meta.env.VITE_REDIRECT_URL}/?${stringifiedSearch}`,
        );
        return;
      }

      if (!errorMessages.length) {
        searchString['sign-up'] = true;
        const stringifiedSearch = queryString.stringify(searchString);

        window.location.replace(
          `${import.meta.env.VITE_REDIRECT_URL}/?${stringifiedSearch}`,
        );
        return;
      }

      const enMessageEntries = Object.entries(ERROR_MESSAGES_EN);
      const translations = errorMessages.map(([message]) => {
        const errorKey = enMessageEntries.find(
          ([, value]) => message === value,
        );
        return errorKey?.[0] ? ERROR_MESSAGES_PT[errorKey[0]] : message;
      });

      const errorRef = this.formRef.querySelector('.js-auth-error');
      errorRef.innerHTML = translations.join('<br/>');
      errorRef.classList.add('visible');
    } finally {
      this.isSubmitLoading = false;
      if (this.formRef.fieldset) {
        this.formRef.fieldset.disabled = false;
      }
      if (this.formRef.submitBtn) {
        this.formRef.submitBtn.classList.remove('loading');
      }
    }
  };

  togglePasswordVisibility() {
    if (this.isVisiblePassword) {
      this.classList.add('sign-up-form__password-input-btn--pass-hidden');
      this.previousElementSibling.type = 'password';
    } else {
      this.classList.remove('sign-up-form__password-input-btn--pass-hidden');
      this.previousElementSibling.type = 'text';
    }
    this.isVisiblePassword = !this.isVisiblePassword;
  }
}

const init = () => {
  const markup = handlebars.compile(signUpFormTemplate)();

  const signUpWrapperRef = document.querySelector('.js-sign-up-wrapper');

  signUpWrapperRef.insertAdjacentHTML('beforeend', markup);

  new SignUpForm({
    formRef: document.forms.signUp,
  });
};

init();
