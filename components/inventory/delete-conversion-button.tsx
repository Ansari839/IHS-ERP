"use client"

import { Button } from "@/components/ui/button"
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
import { Trash2 } from "lucide-react"
import { deleteConversion } from "@/app/actions/inventory"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DeleteConversionButtonProps {
    id: number
}

export function DeleteConversionButton({ id }: DeleteConversionButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onDelete() {
        try {
            setIsLoading(true)
            await deleteConversion(id)
            toast.success("Conversion rule deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete conversion")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isLoading} className="text-destructive hover:text-destructive/90">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete this conversion rule. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
