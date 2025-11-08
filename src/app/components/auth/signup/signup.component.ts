import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth-service.service";
import { matchPasswordValidator } from "src/app/utils/services/matchPasswords";
import { Title, Meta } from "@angular/platform-browser";

@Component({
	selector: "app-signup",
	templateUrl: "./signup.component.html",
	styleUrls: ["./signup.component.css"],
})
export class SignupComponent {
	uploading = false;
	previewUrl: string | ArrayBuffer | null | any = null;
	selectedFile: any;

	signupForm = new FormGroup(
		{
			username: new FormControl("", [Validators.required]),
			email: new FormControl("", [Validators.required, Validators.email]),
			password: new FormControl("", [Validators.required]),
			confirmPassword: new FormControl("", [Validators.required]),
			fullName: new FormControl("", [Validators.required]),
			profilePic: new FormControl("", [Validators.required]),
		},
		{ validators: matchPasswordValidator },
	);

	constructor(
		private authService: AuthService,
		private router: Router,
		private title: Title,
		private meta: Meta,
	) {}

	ngOnInit(): void {
		this.title.setTitle("Join InnChats – Create Your Account");
		this.meta.updateTag({
			name: "description",
			content:
				"Create your InnChats account and start chatting with people around the world securely and instantly.",
		});
		this.meta.updateTag({ name: "robots", content: "index, follow" });
		this.meta.updateTag({
			property: "og:title",
			content: "Join InnChats - Create Your Account",
		});
		this.meta.updateTag({
			property: "og:description",
			content:
				"Create your InnChats account and start chatting with people around the world securely and instantly.",
		});
		this.meta.updateTag({
			property: "og:url",
			content: "https://innchats.vercel.app/auth/signup",
		});
	}

	googleSignUp() {
		this.authService.signInWithGoogle();
	}

	getSignupPayload(): any {
		return {
			username: this.signupForm.get("username")?.value || "",
			email: this.signupForm.get("email")?.value || "",
			password: this.signupForm.get("password")?.value || "",
			fullName: this.signupForm.get("fullName")?.value || "",
			profilePic: this.signupForm.get("profilePic")?.value || "",
		};
	}

	onFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		this.selectedFile = file;

		// Show preview immediately (no upload yet)
		const reader = new FileReader();
		reader.onload = (e) => {
			this.previewUrl = e.target?.result;
			// Temporarily set preview URL in form control for preview img src
			this.signupForm.patchValue({ profilePic: this.previewUrl });
		};
		reader.readAsDataURL(file);
	}

	handleSignup(): void {
		if (this.signupForm.invalid) {
			this.signupForm.markAllAsTouched();
			return;
		}

		if (!this.selectedFile || this.selectedFile == null) {
			this.signupForm.get("profilePic")?.setErrors({ required: true });
			return;
		}

		this.uploading = true;

		// Step 1: Get presigned URL from backend
		this.authService
			.getUploadUrl(this.selectedFile.name, this.selectedFile.type)
			.subscribe({
				next: (data: any) => {
					const uploadUrl = data?.data?.uploadUrl;
					const fileUrl = data?.data?.fileUrl;

					console.log("Presigned URL:", uploadUrl);

					// Step 2: Upload file to S3 directly
					fetch(uploadUrl, {
						method: "PUT",
						body: this.selectedFile,
						headers: {
							"Content-Type": this.selectedFile.type,
						},
					})
						.then((response) => {
							if (!response.ok) {
								throw new Error("S3 upload failed");
							}

							console.log("✅ File uploaded to S3 successfully");

							// Step 3: Use fileUrl in signup payload
							this.signupForm.patchValue({ profilePic: fileUrl });

							const payload = this.getSignupPayload();

							// Step 4: Call your signup API
							this.authService.signup(payload).subscribe({
								next: (res: any) => {
									this.uploading = false;
									const userData = {
										_id: res?.data?._id,
										username: res.data?.username,
										fullName: res.data?.fullName,
										profilePic: res.data?.profilePic,
									};
									this.authService.setCurrentUser(userData);
									this.router.navigate(["/home"]);
								},
								error: (err) => {
									console.error("Signup error", err);
									this.uploading = false;
								},
							});
						})
						.catch((err) => {
							console.error("Upload to S3 error:", err);
							this.uploading = false;
						});
				},
				error: (err) => {
					console.error("Get upload URL error", err);
					this.uploading = false;
				},
			});
	}
}
