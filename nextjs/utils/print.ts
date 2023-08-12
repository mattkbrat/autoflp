export function print({
  elementId,
  style,
  openNewWindow = true,
}: {
  elementId: string | string[];
  style?: string;
  openNewWindow?: boolean;
}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (typeof elementId === 'string') {
    elementId = [elementId];
  }

  let newWindow;

  if (openNewWindow) {
    newWindow = window.open('');
  } else {
    newWindow = window;
  }

  // newWindow = window.open("");

  newWindow?.document.write(
    elementId
      .map(
        (content) =>
          `${
            // If element is a canvas, convert to image
            document.getElementById(content)?.tagName === 'CANVAS' &&
            document.getElementById(content)?.tagName !== 'IMG' &&
            document.getElementById(content)?.tagName !== 'INPUT'
              ? `<br><img alt="printing document" src="${document
                  .getElementById(content)
                  // @ts-ignore
                  ?.toDataURL('image/png', 1.0)}" />`
              : document.getElementById(content)?.innerHTML
          }`,
      )
      .join(''),
  );

  // css
  newWindow?.document.write(
    style ??
      `
    <style>
    a {
          color: black;
          text-decoration: none;
    }
      input, svg, button {
        display: none;
      }
      img {
        width: 100%;
        min-height: 100%;
        // Rotate 90 degrees to fit on page
        transform: rotate(90deg);
        filter: grayscale(100%);
      }
        body {
            font-family: "Roboto", sans-serif;
            font-size: 1rem;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
            font-size: 1rem;
        }
        canvas {
            display: block;
        }
        tr:nth-child(even) {
            background-color: #dddddd;
        }
        // div {
        //     display: block;
        // }

        // div > div {
        //     display: inline-block;
        //     // separate
        //     margin-right: 1rem;
        // }

    </style>
`,
  );

  newWindow?.document.close();
  newWindow?.focus();
  newWindow?.print();
  newWindow?.location.reload();
  newWindow?.close();
}
