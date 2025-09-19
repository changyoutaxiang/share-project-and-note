import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "项目组名称不能为空").max(100, "项目组名称不能超过100个字符"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "请选择有效的颜色").default("#3B82F6"),
  status: z.enum(["active", "archived"]).default("active"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateProjectGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
  mode?: "create" | "edit";
}

// 预设颜色选项
const colorOptions = [
  { label: "蓝色", value: "#3B82F6", bg: "bg-blue-500" },
  { label: "绿色", value: "#10B981", bg: "bg-emerald-500" },
  { label: "紫色", value: "#8B5CF6", bg: "bg-violet-500" },
  { label: "红色", value: "#EF4444", bg: "bg-red-500" },
  { label: "橙色", value: "#F59E0B", bg: "bg-amber-500" },
  { label: "青色", value: "#06B6D4", bg: "bg-cyan-500" },
  { label: "粉色", value: "#EC4899", bg: "bg-pink-500" },
  { label: "灰色", value: "#6B7280", bg: "bg-gray-500" },
];

export default function CreateProjectGroupDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: CreateProjectGroupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      color: initialData?.color || "#3B82F6",
      status: initialData?.status || "active",
    },
  });

  const selectedColor = form.watch("color");

  // 当对话框打开时重置表单数据
  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        color: initialData?.color || "#3B82F6",
        status: initialData?.status || "active",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Failed to create project group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "编辑项目组" : "创建项目组"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "修改项目组的信息" : "创建一个新的项目组来组织和管理相关项目"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 项目组名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目组名称 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="如：AI训练营、技术项目、日常工作"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>给项目组一个清晰的名称</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 项目组描述 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="描述这个项目组的用途和目标..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>可选：描述项目组的用途</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 颜色选择 */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标识颜色</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-border"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <Input
                          type="color"
                          value={field.value}
                          onChange={field.onChange}
                          className="w-20 h-8 p-1 cursor-pointer"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color.value
                                ? "border-foreground scale-110"
                                : "border-border hover:scale-105"
                            } ${color.bg}`}
                            onClick={() => field.onChange(color.value)}
                            disabled={isSubmitting}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>选择项目组的标识颜色</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 状态 */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择项目组状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="archived">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>新项目组通常设为活跃状态</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "保存修改" : "创建项目组"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}