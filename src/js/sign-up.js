import { SignUpForm, compileSignUpFormMarkup, setToLS } from 'mayanbet-sdk';

const init = () => {
  const markup = compileSignUpFormMarkup();

  const signUpWrapperRef = document.querySelector('.js-sign-up-wrapper');

  signUpWrapperRef.insertAdjacentHTML('beforeend', markup);

  new SignUpForm({
    formRef: document.forms.signUp,
    submitCallback: async () => {
      setToLS('isAlreadyRegistered', true);
    },
  });
};

init();
