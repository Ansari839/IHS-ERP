"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteCategoryButtonProps {
    id: number
    name: string
}

export function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onDelete() {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/production/categories/${id}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete category")
            }

            toast.success("Category deleted")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the category <strong>{name}</strong>.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onDelete()
                        }}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
