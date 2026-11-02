//register page
import PageWrapper from "../../components/PageWrapper";
import CompanyRegister from "./companyRegister";
import UserRegister from "./UserRegister";

export default function Register() {
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Get Started
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Choose an option to continue with your workspace.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side */}
          <CompanyRegister />

          {/* Right side */}
          <UserRegister />
        </div>
      </div>
    </PageWrapper>
  );
}

