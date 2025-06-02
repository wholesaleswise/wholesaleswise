// import {
//   AlignCenter,
//   AlignLeft,
//   AlignRight,
//   Bold,
//   Heading1,
//   Heading2,
//   Heading3,
//   Highlighter,
//   Italic,
//   List,
//   ListOrdered,
//   Strikethrough,
//   Image as ImageIcon,
//   Underline,
//   Undo2,
//   Redo2,
// } from "lucide-react";

// import { Toggle } from "../ui/toggle";

// export default function MenuBar({ editor }) {
//   if (!editor) {
//     return null;
//   }

//   const Options = [
//     {
//       icon: <Heading1 className="size-4" />,
//       onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
//       preesed: editor.isActive("heading", { level: 1 }),
//     },
//     {
//       icon: <Heading2 className="size-4" />,
//       onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
//       preesed: editor.isActive("heading", { level: 2 }),
//     },
//     {
//       icon: <Heading3 className="size-4" />,
//       onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
//       preesed: editor.isActive("heading", { level: 3 }),
//     },
//     {
//       icon: <Bold className="size-4" />,
//       onClick: () => editor.chain().focus().toggleBold().run(),
//       preesed: editor.isActive("bold"),
//     },
//     {
//       icon: <Italic className="size-4" />,
//       onClick: () => editor.chain().focus().toggleItalic().run(),
//       preesed: editor.isActive("italic"),
//     },
//     {
//       icon: <Underline className="size-4" />,
//       onClick: () => editor.chain().focus().toggleUnderline().run(),
//       preesed: editor.isActive("underline"),
//     },
//     {
//       icon: <Strikethrough className="size-4" />,
//       onClick: () => editor.chain().focus().toggleStrike().run(),
//       preesed: editor.isActive("strike"),
//     },
//     {
//       icon: <AlignLeft className="size-4" />,
//       onClick: () => editor.chain().focus().setTextAlign("left").run(),
//       preesed: editor.isActive({ textAlign: "left" }),
//     },
//     {
//       icon: <AlignCenter className="size-4" />,
//       onClick: () => editor.chain().focus().setTextAlign("center").run(),
//       preesed: editor.isActive({ textAlign: "center" }),
//     },
//     {
//       icon: <AlignRight className="size-4" />,
//       onClick: () => editor.chain().focus().setTextAlign("right").run(),
//       preesed: editor.isActive({ textAlign: "right" }),
//     },
//     {
//       icon: <List className="size-4" />,
//       onClick: () => editor.chain().focus().toggleBulletList().run(),
//       preesed: editor.isActive("bulletList"),
//     },
//     {
//       icon: <ListOrdered className="size-4" />,
//       onClick: () => editor.chain().focus().toggleOrderedList().run(),
//       preesed: editor.isActive("orderedList"),
//     },
//     {
//       icon: <Highlighter className="size-4" />,
//       onClick: () =>
//         editor.chain().focus().toggleHighlight({ color: "#74c0fc" }).run(),
//       preesed: editor.isActive("highlight"),
//     },

//     {
//       icon: <ImageIcon className="size-4" />,
//       onClick: () => {
//         const url = window.prompt("Enter image URL");
//         if (url) {
//           editor.chain().focus().setImage({ src: url }).run();
//         }
//       },
//       preesed: editor.isActive("image"),
//     },
//     {
//       icon: <Undo2 className="size-4" />,
//       onClick: () => editor.chain().focus().undo().run(),
//       disabled: !editor.can().undo(),
//       preesed: editor.isActive("undo"),
//     },
//     {
//       icon: <Redo2 className="size-4" />,
//       onClick: () => editor.chain().focus().redo().run(),
//       disabled: !editor.can().redo(),
//       preesed: editor.isActive("redo"),
//     },

//     // {
//     //   icon: <TableIcon className="size-4" />,
//     //   onClick: () => {
//     //     if (editor.isActive("table")) {
//     //       editor.chain().focus().deleteTable().run();
//     //     } else {
//     //       editor
//     //         .chain()
//     //         .focus()
//     //         .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
//     //         .run();
//     //     }
//     //   },
//     //   pressed: editor.isActive("table"),
//     // },
//   ];

//   return (
//     <div className="border rounded-md p-1 mb-1 bg-slate-50 space-x-2 z-50">
//       {Options.map((option, index) => (
//         <Toggle
//           key={index}
//           pressed={option.preesed}
//           onPressedChange={option.onClick}
//         >
//           {option.icon}
//         </Toggle>
//       ))}
//     </div>
//   );
// }

// import {
//   AlignCenter,
//   AlignLeft,
//   AlignRight,
//   Bold,
//   Heading1,
//   Heading2,
//   Heading3,
//   Highlighter,
//   Italic,
//   List,
//   ListOrdered,
//   Strikethrough,
//   Image as ImageIcon,
//   Underline,
//   Undo2,
//   Redo2,
//   Link,
// } from "lucide-react";

// import { Toggle } from "../ui/toggle";
// import { useCallback } from "react";

// export default function MenuBar({ editor }) {
//   if (!editor) {
//     return null;
//   }

//   const highlightColors = [
//     { color: "#ffe066", label: "Yellow" },
//     { color: "#74c0fc", label: "Blue" },
//     { color: "#f783ac", label: "Pink" },
//   ];
//   const textColors = [
//     { color: "#ffe066", label: "Yellow" },
//     { color: "#74c0fc", label: "Blue" },
//     { color: "#f783ac", label: "Pink" },
//     { color: "#ff5733", label: "Red" },
//     { color: "#6a0dad", label: "Purple" },
//   ];
//   const setLink = useCallback(() => {
//     const previousUrl = editor.getAttributes("link").href;
//     const url = window.prompt("URL", previousUrl);

//     // cancelled
//     if (url === null) {
//       return;
//     }

//     // empty
//     if (url === "") {
//       editor.chain().focus().extendMarkRange("link").unsetLink().run();
//       return;
//     }

//     // update link
//     try {
//       editor
//         .chain()
//         .focus()
//         .extendMarkRange("link")
//         .setLink({ href: url })
//         .run();
//     } catch (e) {
//       alert(e.message);
//     }
//   }, [editor]);

//   const Options = [
//     {
//       icon: <Heading1 className="size-4" />,
//       onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
//       preesed: editor.isActive("heading", { level: 1 }),
//     },
//     {
//       icon: <Heading2 className="size-4" />,
//       onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
//       preesed: editor.isActive("heading", { level: 2 }),
//     },
//     {
//       icon: <Heading3 className="size-4" />,
//       onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
//       preesed: editor.isActive("heading", { level: 3 }),
//     },
//     {
//       icon: <Bold className="size-4" />,
//       onClick: () => editor.chain().focus().toggleBold().run(),
//       preesed: editor.isActive("bold"),
//     },
//     {
//       icon: <Italic className="size-4" />,
//       onClick: () => editor.chain().focus().toggleItalic().run(),
//       preesed: editor.isActive("italic"),
//     },
//     {
//       icon: <Underline className="size-4" />,
//       onClick: () => editor.chain().focus().toggleUnderline().run(),
//       preesed: editor.isActive("underline"),
//     },
//     {
//       icon: <Strikethrough className="size-4" />,
//       onClick: () => editor.chain().focus().toggleStrike().run(),
//       preesed: editor.isActive("strike"),
//     },
//     {
//       icon: <AlignLeft className="size-4" />,
//       onClick: () => editor.chain().focus().setTextAlign("left").run(),
//       preesed: editor.isActive({ textAlign: "left" }),
//     },
//     {
//       icon: <AlignCenter className="size-4" />,
//       onClick: () => editor.chain().focus().setTextAlign("center").run(),
//       preesed: editor.isActive({ textAlign: "center" }),
//     },
//     {
//       icon: <AlignRight className="size-4" />,
//       onClick: () => editor.chain().focus().setTextAlign("right").run(),
//       preesed: editor.isActive({ textAlign: "right" }),
//     },
//     {
//       icon: <List className="size-4" />,
//       onClick: () => editor.chain().focus().toggleBulletList().run(),
//       preesed: editor.isActive("bulletList"),
//     },
//     {
//       icon: <ListOrdered className="size-4" />,
//       onClick: () => editor.chain().focus().toggleOrderedList().run(),
//       preesed: editor.isActive("orderedList"),
//     },
//     {
//       icon: <Link className="size-4" />,
//       onClick: () => {
//         if (editor.isActive("link")) {
//           editor.chain().focus().unsetLink().run();
//         } else {
//           setLink();
//         }
//       },
//       pressed: editor.isActive("link"),
//     },
//     {
//       icon: <ImageIcon className="size-4" />,
//       onClick: () => {
//         const url = window.prompt("Enter image URL");
//         if (url) {
//           editor.chain().focus().setImage({ src: url }).run();
//         }
//       },
//       preesed: editor.isActive("image"),
//     },
//     {
//       icon: <Undo2 className="size-4" />,
//       onClick: () => editor.chain().focus().undo().run(),
//       disabled: !editor.can().undo(),
//       preesed: editor.isActive("undo"),
//     },
//     {
//       icon: <Redo2 className="size-4" />,
//       onClick: () => editor.chain().focus().redo().run(),
//       disabled: !editor.can().redo(),
//       preesed: editor.isActive("redo"),
//     },
//   ];

//   return (
//     <div className="border rounded-md p-1 mb-1 bg-slate-50 flex flex-wrap gap-2 z-50">
//       {Options.map((option, index) => (
//         <Toggle
//           key={index}
//           pressed={option.preesed}
//           onPressedChange={option.onClick}
//           disabled={option.disabled}
//         >
//           {option.icon}
//         </Toggle>
//       ))}

//       {/* Highlight Color Toggles */}
//       <div className="flex gap-1 items-center">
//         {highlightColors.map((highlight, index) => (
//           <Toggle
//             key={`highlight-${index}`}
//             pressed={editor.isActive("highlight", { color: highlight.color })}
//             onPressedChange={() =>
//               editor
//                 .chain()
//                 .focus()
//                 .toggleHighlight({ color: highlight.color })
//                 .run()
//             }
//             className="relative"
//           >
//             <Highlighter
//               className="size-4"
//               style={{ color: highlight.color }}
//             />
//           </Toggle>
//         ))}
//       </div>
//       <div className="flex gap-1 items-center">
//         {textColors.map((textColor, index) => (
//           <Toggle
//             key={`text-color-${index}`}
//             pressed={editor.isActive("textStyle", { color: textColor.color })}
//             onPressedChange={() =>
//               editor
//                 .chain()
//                 .focus()
//                 .toggleTextStyle({ color: textColor.color })
//                 .run()
//             }
//           >
//             <span
//               className="inline-block w-5 h-5 rounded-full"
//               style={{ backgroundColor: textColor.color }}
//             ></span>
//           </Toggle>
//         ))}
//       </div>
//     </div>
//   );
// }

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Image as ImageIcon,
  Underline,
  Undo2,
  Redo2,
  Link,
} from "lucide-react";

import { Toggle } from "../ui/toggle";
import { useCallback } from "react";

export default function MenuBar({ editor }) {
  if (!editor) {
    return null;
  }

  const highlightColors = [
    { color: "#ffe066", label: "Yellow" },
    { color: "#74c0fc", label: "Blue" },
    { color: "#f783ac", label: "Pink" },
  ];

  const textColors = [
    { color: "#ffe066", label: "Yellow" },
    { color: "#74c0fc", label: "Blue" },
    { color: "#f783ac", label: "Pink" },
    { color: "#ff5733", label: "Red" },
    { color: "#6a0dad", label: "Purple" },
  ];

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      alert(e.message);
    }
  }, [editor]);

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: <Underline className="size-4" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },
    {
      icon: <Link className="size-4" />,
      onClick: () => {
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run();
        } else {
          setLink();
        }
      },
      pressed: editor.isActive("link"),
    },
    {
      icon: <ImageIcon className="size-4" />,
      onClick: () => {
        const url = window.prompt("Enter image URL");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      pressed: editor.isActive("image"),
    },
    {
      icon: <Undo2 className="size-4" />,
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      pressed: false,
    },
    {
      icon: <Redo2 className="size-4" />,
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      pressed: false,
    },
  ];

  return (
    <div className="border rounded-md p-1 mb-1 bg-slate-50 flex flex-wrap gap-2 z-50">
      {Options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.pressed}
          onPressedChange={option.onClick}
          disabled={option.disabled}
        >
          {option.icon}
        </Toggle>
      ))}

      {/* Highlight Color Toggles */}
      <div className="flex gap-1 items-center">
        {highlightColors.map((highlight, index) => (
          <Toggle
            key={`highlight-${index}`}
            pressed={editor.isActive("highlight", { color: highlight.color })}
            onPressedChange={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: highlight.color })
                .run()
            }
            className="relative  "
          >
            <Highlighter
              className="size-4"
              style={{ color: highlight.color }}
            />
          </Toggle>
        ))}
      </div>

      {/* Text Color Toggles */}
      <div className="flex gap-1 items-center">
        {textColors.map((textColor, index) => (
          <Toggle
            key={`text-color-${index}`}
            pressed={editor.isActive("textStyle", { color: textColor.color })}
            onPressedChange={() => {
              const isActive = editor.isActive("textStyle", {
                color: textColor.color,
              });
              if (isActive) {
                editor.chain().focus().unsetColor().run();
              } else {
                editor.chain().focus().setColor(textColor.color).run();
              }
            }}
            className="relative "
          >
            <span
              className="size-4"
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: textColor.color,
              }}
            ></span>
          </Toggle>
        ))}
      </div>
    </div>
  );
}
