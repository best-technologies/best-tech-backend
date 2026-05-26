// src/utils/response.ts

export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  length?: number;
  data?: T;
  error?: unknown;
}

export function successResponse<T = unknown>(
  statusCode: number,
  success: boolean = true,
  message: string,
  length?: number,
  data?: T,
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    statusCode,
    success,
    message,
  };

  if (length !== undefined) {
    response.length = length;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return response;
}

export function failureResponse(
  statusCode: number,
  message: string,
  success: boolean = false,
  error: unknown = null,
): ApiResponse<never> {
  return {
    statusCode,
    success,
    message,
    error,
  };
}

//   <script type="text/javascript">
//   (function(d, t) {
//       var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
//       v.onload = function() {
//         window.voiceflow.chat.load({
//           verify: { projectID: '682ce1cae52f734c2953ce1f' },
//           url: 'https://general-runtime.voiceflow.com',
//           versionID: 'production',
//           voice: {
//             url: "https://runtime-api.voiceflow.com"
//           },
//           assistant: {
//             persistence: 'localStorage' // Configure persistence here
//           }
//         });
//         window.voiceflow.chat.proactive.push(
//           {
//             type: 'text',
//             payload: { message: "Need instant reply?, clcik here to proceed" }
//           },
//         )
//       }
//       v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
//   })(document, 'script');
// </script>
