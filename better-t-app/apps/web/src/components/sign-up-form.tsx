import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({ from: "/login" });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", passwordConfirm: "" },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        { name: value.name, email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate({ to: "/diary" });
            toast.success("アカウントを作成しました");
          },
          onError: (error) => {
            toast.error(error.error.message || "登録に失敗しました");
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(1, "お名前を入力してください").max(50, "50文字以内で入力してください"),
          email: z.email("有効なメールアドレスを入力してください"),
          password: z.string().min(8, "パスワードは8文字以上で入力してください"),
          passwordConfirm: z.string().min(1, "確認用パスワードを入力してください"),
        })
        .refine((data) => data.password === data.passwordConfirm, {
          message: "パスワードが一致しません",
          path: ["passwordConfirm"],
        }),
    },
  });

  const fieldClass = "space-y-1.5";
  const labelClass = "text-sm font-medium";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
      className="space-y-4"
    >
      <form.Field name="name">
        {(field) => (
          <div className={fieldClass}>
            <Label htmlFor={field.name} className={labelClass}>表示名</Label>
            <Input
              id={field.name}
              placeholder="山田 太郎"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((e) => (
              <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className={fieldClass}>
            <Label htmlFor={field.name} className={labelClass}>メールアドレス</Label>
            <Input
              id={field.name}
              type="email"
              placeholder="you@example.com"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((e) => (
              <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className={fieldClass}>
            <Label htmlFor={field.name} className={labelClass}>パスワード</Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showPassword ? "text" : "password"}
                placeholder="8文字以上"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {field.state.meta.errors.map((e) => (
              <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="passwordConfirm">
        {(field) => (
          <div className={fieldClass}>
            <Label htmlFor={field.name} className={labelClass}>パスワード（確認）</Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="もう一度入力"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPasswordConfirm ? "パスワードを隠す" : "パスワードを表示する"}
              >
                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {field.state.meta.errors.map((e) => (
              <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
        {({ canSubmit, isSubmitting }) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "登録中..." : "アカウントを作成"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
